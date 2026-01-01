"""사용자 API 엔드포인트."""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.models.user import User, UserProfile
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
    """현재 사용자 비활성화 (회원 탈퇴)."""
    current_user.is_active = False
    await db.flush()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserResponse:
    """특정 사용자 정보 조회 (관리자 전용)."""
    from uuid import UUID

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
    from uuid import UUID

    from app.models.user import UserRole

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
    from uuid import UUID

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
