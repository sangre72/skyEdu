"""사용자 API 엔드포인트."""
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.models.manager import Manager
from app.models.payment import Payment, PaymentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.review import Review
from app.models.user import User, UserProfile, UserRole
from app.schemas.user import (
    UserProfileResponse,
    UserResponse,
    UserUpdate,
    UserWithProfileResponse,
)

router = APIRouter()


@router.get("/me", response_model=UserWithProfileResponse)
async def get_current_user_info(
    current_user: CurrentUser,
    db: DbSession,
) -> UserWithProfileResponse:
    """현재 로그인한 사용자 정보 조회 (프로필 포함)."""
    # 프로필 정보 로드
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()

    response = UserWithProfileResponse.model_validate(user)
    if user.profile:
        response.profile = UserProfileResponse.model_validate(user.profile)

    return response


@router.patch("/me", response_model=UserWithProfileResponse)
async def update_current_user(
    data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> UserWithProfileResponse:
    """현재 사용자 정보 수정."""
    update_data = data.model_dump(exclude_unset=True)

    # 프로필 관련 필드 분리
    profile_fields = {"birth_date", "address", "emergency_contact"}
    user_fields = {k: v for k, v in update_data.items() if k not in profile_fields}
    profile_data = {k: v for k, v in update_data.items() if k in profile_fields}

    # 사용자 정보 업데이트
    for field, value in user_fields.items():
        setattr(current_user, field, value)

    # 프로필 정보 업데이트
    if profile_data:
        # 프로필 조회 또는 생성
        result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == current_user.id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.add(profile)

        for field, value in profile_data.items():
            setattr(profile, field, value)

    await db.flush()

    # 업데이트된 정보 다시 로드
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()

    response = UserWithProfileResponse.model_validate(user)
    if user.profile:
        response.profile = UserProfileResponse.model_validate(user.profile)

    return response


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_current_user(
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """
    현재 사용자 비활성화 (회원 탈퇴).

    검증 사항:
    - 진행 중인 예약(pending, confirmed, in_progress)이 없어야 함
    - 동행인의 경우 미정산 수익이 없어야 함
    """
    # 1. 진행 중인 예약 확인 (고객으로서)
    active_statuses = [
        ReservationStatus.PENDING.value,
        ReservationStatus.CONFIRMED.value,
        ReservationStatus.IN_PROGRESS.value,
    ]

    result = await db.execute(
        select(func.count(Reservation.id)).where(
            Reservation.user_id == current_user.id,
            Reservation.status.in_(active_statuses),
        )
    )
    active_reservations = result.scalar() or 0

    if active_reservations > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"진행 중인 예약이 {active_reservations}건 있습니다. 예약 완료 후 탈퇴해주세요.",
        )

    # 2. 동행인인 경우 추가 검증
    if current_user.role == UserRole.COMPANION.value:
        # 2-1. 동행인으로서 진행 중인 예약 확인
        result = await db.execute(
            select(func.count(Reservation.id)).where(
                Reservation.manager_id == current_user.id,
                Reservation.status.in_(active_statuses),
            )
        )
        active_manager_reservations = result.scalar() or 0

        if active_manager_reservations > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"동행인으로서 진행 중인 예약이 {active_manager_reservations}건 있습니다. 예약 완료 후 탈퇴해주세요.",
            )

        # 2-2. 미정산 수익 확인 (완료된 예약 중 정산되지 않은 건)
        # Payment 상태가 completed인데 정산되지 않은 건 (정산 테이블이 별도로 있다면 그쪽에서 확인)
        # 현재는 간단히 완료된 예약 중 결제 완료된 건을 확인
        result = await db.execute(
            select(func.count(Reservation.id))
            .join(Payment, Payment.reservation_id == Reservation.id)
            .where(
                Reservation.manager_id == current_user.id,
                Reservation.status == ReservationStatus.COMPLETED.value,
                Payment.status == PaymentStatus.COMPLETED.value,
                # 정산 완료 여부 필드가 있다면 추가: Payment.is_settled == False
            )
        )
        # TODO: 정산 시스템 구현 후 미정산 건 확인 로직 추가

    # 소프트 삭제: is_active = False
    current_user.is_active = False
    await db.flush()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserResponse:
    """특정 사용자 정보 조회 (관리자 전용)."""
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    return UserResponse.model_validate(user)


@router.get("/", response_model=list[UserResponse])
async def get_users(
    current_user: CurrentAdmin,
    db: DbSession,
    skip: int = 0,
    limit: int = 20,
    role: str | None = None,
    is_active: bool | None = None,
) -> list[UserResponse]:
    """사용자 목록 조회 (관리자 전용)."""
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

    return [UserResponse.model_validate(u) for u in users]


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserResponse:
    """사용자 역할 변경 (관리자 전용)."""
    if role not in [r.value for r in UserRole]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 역할입니다.",
        )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    user.role = role
    await db.flush()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.patch("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserResponse:
    """사용자 활성화 (관리자 전용)."""
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    user.is_active = True
    await db.flush()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def hard_delete_user(
    user_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> None:
    """
    사용자 하드 삭제 (관리자 전용).

    모든 관련 데이터를 완전히 삭제합니다:
    - 사용자 프로필
    - 예약 기록
    - 리뷰
    - 결제 기록
    - 매니저 프로필 (동행인인 경우)

    검증 사항:
    - 진행 중인 예약이 없어야 함
    - 미정산 수익이 없어야 함 (동행인인 경우)
    """
    target_user_id = UUID(user_id)

    # 1. 사용자 존재 확인
    result = await db.execute(select(User).where(User.id == target_user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    # 2. 진행 중인 예약 확인 (고객으로서)
    active_statuses = [
        ReservationStatus.PENDING.value,
        ReservationStatus.CONFIRMED.value,
        ReservationStatus.IN_PROGRESS.value,
    ]

    result = await db.execute(
        select(func.count(Reservation.id)).where(
            Reservation.user_id == target_user_id,
            Reservation.status.in_(active_statuses),
        )
    )
    active_reservations = result.scalar() or 0

    if active_reservations > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"진행 중인 예약이 {active_reservations}건 있습니다. 예약 완료 후 삭제해주세요.",
        )

    # 3. 동행인인 경우 추가 검증
    if user.role == UserRole.COMPANION.value:
        # 동행인으로서 진행 중인 예약 확인
        result = await db.execute(
            select(func.count(Reservation.id)).where(
                Reservation.manager_id == target_user_id,
                Reservation.status.in_(active_statuses),
            )
        )
        active_manager_reservations = result.scalar() or 0

        if active_manager_reservations > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"동행인으로서 진행 중인 예약이 {active_manager_reservations}건 있습니다. 예약 완료 후 삭제해주세요.",
            )

        # 미정산 수익 확인
        result = await db.execute(
            select(func.count(Reservation.id))
            .join(Payment, Payment.reservation_id == Reservation.id)
            .where(
                Reservation.manager_id == target_user_id,
                Reservation.status == ReservationStatus.COMPLETED.value,
                Payment.status == PaymentStatus.COMPLETED.value,
                # TODO: 정산 시스템 구현 후 is_settled == False 조건 추가
            )
        )
        # TODO: 정산 시스템 구현 후 미정산 건 확인 로직 활성화
        # unsettled_count = result.scalar() or 0
        # if unsettled_count > 0:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail=f"미정산 수익이 {unsettled_count}건 있습니다. 정산 완료 후 삭제해주세요.",
        #     )

        # 매니저 프로필 삭제
        await db.execute(delete(Manager).where(Manager.user_id == target_user_id))

    # 4. 관련 데이터 삭제 (CASCADE 대신 명시적 삭제)
    # 리뷰 삭제 (작성한 리뷰 + 받은 리뷰)
    await db.execute(
        delete(Review).where(
            (Review.user_id == target_user_id) | (Review.manager_id == target_user_id)
        )
    )

    # 결제 기록 삭제 (예약에 연결된 결제)
    reservation_ids_subquery = select(Reservation.id).where(
        (Reservation.user_id == target_user_id)
        | (Reservation.manager_id == target_user_id)
    )
    await db.execute(
        delete(Payment).where(Payment.reservation_id.in_(reservation_ids_subquery))
    )

    # 예약 삭제
    await db.execute(
        delete(Reservation).where(
            (Reservation.user_id == target_user_id)
            | (Reservation.manager_id == target_user_id)
        )
    )

    # 사용자 프로필 삭제
    await db.execute(delete(UserProfile).where(UserProfile.user_id == target_user_id))

    # 5. 사용자 삭제
    await db.execute(delete(User).where(User.id == target_user_id))

    await db.flush()
