from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import CurrentAdmin, DbSession
from app.models.user_group import UserGroup
from app.schemas.user_group import (
    UserGroupCreate,
    UserGroupResponse,
    UserGroupUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[UserGroupResponse])
async def get_user_groups(
    current_user: CurrentAdmin,
    db: DbSession,
    skip: int = 0,
    limit: int = 100,
) -> list[UserGroupResponse]:
    """사용자 그룹 목록 조회 (관리자 전용)."""
    result = await db.execute(
        select(UserGroup).offset(skip).limit(limit).order_by(UserGroup.name)
    )
    groups = result.scalars().all()
    return [UserGroupResponse.model_validate(g) for g in groups]


@router.post("/", response_model=UserGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_user_group(
    data: UserGroupCreate,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserGroupResponse:
    """사용자 그룹 생성 (관리자 전용)."""
    # 이름 중복 확인
    result = await db.execute(select(UserGroup).where(UserGroup.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 그룹 이름입니다.",
        )

    group = UserGroup(**data.model_dump())
    db.add(group)
    
    try:
        await db.flush()
        await db.refresh(group)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="그룹 생성 중 오류가 발생했습니다.",
        )

    return UserGroupResponse.model_validate(group)


@router.get("/{group_id}", response_model=UserGroupResponse)
async def get_user_group(
    group_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserGroupResponse:
    """특정 사용자 그룹 조회 (관리자 전용)."""
    result = await db.execute(select(UserGroup).where(UserGroup.id == UUID(group_id)))
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="그룹을 찾을 수 없습니다.",
        )

    return UserGroupResponse.model_validate(group)


@router.patch("/{group_id}", response_model=UserGroupResponse)
async def update_user_group(
    group_id: str,
    data: UserGroupUpdate,
    current_user: CurrentAdmin,
    db: DbSession,
) -> UserGroupResponse:
    """사용자 그룹 수정 (관리자 전용)."""
    result = await db.execute(select(UserGroup).where(UserGroup.id == UUID(group_id)))
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="그룹을 찾을 수 없습니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    
    # 이름 변경 시 중복 확인
    if "name" in update_data and update_data["name"] != group.name:
        result = await db.execute(
            select(UserGroup).where(UserGroup.name == update_data["name"])
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 그룹 이름입니다.",
            )

    for field, value in update_data.items():
        setattr(group, field, value)

    await db.flush()
    await db.refresh(group)

    return UserGroupResponse.model_validate(group)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_group(
    group_id: str,
    current_user: CurrentAdmin,
    db: DbSession,
) -> None:
    """사용자 그룹 삭제 (관리자 전용)."""
    result = await db.execute(select(UserGroup).where(UserGroup.id == UUID(group_id)))
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="그룹을 찾을 수 없습니다.",
        )

    # 사용자가 할당된 그룹인지 확인 (FK 제약조건 때문에 삭제 불가할 수 있음)
    # 하지만 User 모델에서 ondelete="SET NULL"로 설정했으므로 삭제 가능해야 함.
    # 명시적으로 확인하고 싶다면 여기서 count 쿼리를 날릴 수 있음.

    await db.delete(group)
    await db.flush()
