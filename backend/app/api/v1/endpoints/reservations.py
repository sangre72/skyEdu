"""예약 API 엔드포인트."""
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentManager, CurrentUser, DbSession
from app.models.reservation import Reservation, ReservationStatus, ServiceType
from app.models.user import UserRole
from app.schemas.reservation import (
    ReservationCreate,
    ReservationListResponse,
    ReservationResponse,
    ReservationUpdate,
)

router = APIRouter()

# 서비스 타입별 시간당 가격
SERVICE_PRICES = {
    ServiceType.FULL_CARE.value: Decimal("35000"),
    ServiceType.HOSPITAL_CARE.value: Decimal("25000"),
    ServiceType.SPECIAL_CARE.value: Decimal("50000"),
}


def calculate_price(service_type: str, hours: Decimal) -> Decimal:
    """서비스 가격 계산."""
    base_price = SERVICE_PRICES.get(service_type, Decimal("25000"))
    return base_price * hours


@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    data: ReservationCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> ReservationResponse:
    """예약 생성."""
    # 가격 계산
    price = calculate_price(data.service_type, data.estimated_hours)

    reservation = Reservation(
        user_id=current_user.id,
        manager_id=data.manager_id,
        service_type=data.service_type,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        estimated_hours=data.estimated_hours,
        hospital_name=data.hospital_name,
        hospital_address=data.hospital_address,
        hospital_department=data.hospital_department,
        pickup_address=data.pickup_address,
        symptoms=data.symptoms,
        special_requests=data.special_requests,
        price=price,
        status=ReservationStatus.PENDING.value,
    )

    db.add(reservation)
    await db.flush()
    await db.refresh(reservation)

    return ReservationResponse.model_validate(reservation)


@router.get("/", response_model=ReservationListResponse)
async def get_reservations(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> ReservationListResponse:
    """예약 목록 조회."""
    query = select(Reservation)

    # 역할에 따른 필터링
    if current_user.role == UserRole.CUSTOMER.value:
        query = query.where(Reservation.user_id == current_user.id)
    elif current_user.role == UserRole.MANAGER.value:
        query = query.where(Reservation.manager_id == current_user.id)
    # 관리자는 모든 예약 조회 가능

    if status_filter:
        query = query.where(Reservation.status == status_filter)

    # 총 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(Reservation.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    reservations = result.scalars().all()

    return ReservationListResponse(
        items=[ReservationResponse.model_validate(r) for r in reservations],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> ReservationResponse:
    """예약 상세 조회."""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 권한 확인 (본인, 담당 매니저, 관리자만)
    if current_user.role == UserRole.CUSTOMER.value:
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )
    elif current_user.role == UserRole.MANAGER.value:
        if reservation.manager_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    return ReservationResponse.model_validate(reservation)


@router.patch("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: UUID,
    data: ReservationUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ReservationResponse:
    """예약 수정."""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 권한 확인 (본인, 관리자만)
    if current_user.role == UserRole.CUSTOMER.value:
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    # 수정 가능 상태 확인
    if reservation.status not in [
        ReservationStatus.PENDING.value,
        ReservationStatus.CONFIRMED.value,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="수정할 수 없는 예약 상태입니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reservation, field, value)

    await db.flush()
    await db.refresh(reservation)

    return ReservationResponse.model_validate(reservation)


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_reservation(
    reservation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """예약 취소."""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 권한 확인
    if current_user.role == UserRole.CUSTOMER.value:
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    # 취소 가능 상태 확인
    if reservation.status in [
        ReservationStatus.COMPLETED.value,
        ReservationStatus.CANCELLED.value,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="취소할 수 없는 예약 상태입니다.",
        )

    reservation.status = ReservationStatus.CANCELLED.value
    await db.flush()


@router.patch("/{reservation_id}/status", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: UUID,
    new_status: str,
    current_user: CurrentManager,
    db: DbSession,
) -> ReservationResponse:
    """예약 상태 변경 (매니저/관리자)."""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 매니저인 경우 담당 예약만
    if current_user.role == UserRole.MANAGER.value:
        if reservation.manager_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    # 유효한 상태 변경인지 확인
    valid_transitions = {
        ReservationStatus.PENDING.value: [
            ReservationStatus.CONFIRMED.value,
            ReservationStatus.CANCELLED.value,
        ],
        ReservationStatus.CONFIRMED.value: [
            ReservationStatus.IN_PROGRESS.value,
            ReservationStatus.CANCELLED.value,
        ],
        ReservationStatus.IN_PROGRESS.value: [
            ReservationStatus.COMPLETED.value,
            ReservationStatus.CANCELLED.value,
        ],
    }

    allowed = valid_transitions.get(reservation.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{reservation.status}'에서 '{new_status}'로 변경할 수 없습니다.",
        )

    reservation.status = new_status
    await db.flush()
    await db.refresh(reservation)

    return ReservationResponse.model_validate(reservation)


@router.patch("/{reservation_id}/assign", response_model=ReservationResponse)
async def assign_manager(
    reservation_id: UUID,
    manager_id: UUID,
    current_user: CurrentManager,
    db: DbSession,
) -> ReservationResponse:
    """매니저 배정 (매니저 본인 또는 관리자)."""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    if reservation.status != ReservationStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="대기 상태의 예약만 배정할 수 있습니다.",
        )

    # 매니저인 경우 본인만 배정 가능
    if current_user.role == UserRole.MANAGER.value:
        if manager_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="본인만 배정할 수 있습니다.",
            )

    reservation.manager_id = manager_id
    reservation.status = ReservationStatus.CONFIRMED.value
    await db.flush()
    await db.refresh(reservation)

    return ReservationResponse.model_validate(reservation)
