"""프로모션 API 엔드포인트.

coding-guide 규칙 준수:
- is_deleted=False 필터 적용 (Soft Delete)
- created_by, updated_by 설정
"""
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.api.deps import CurrentManager, DbSession
from app.models.manager import Manager
from app.models.promotion import Promotion
from app.schemas.promotion import (
    PromotionCreate,
    PromotionListResponse,
    PromotionResponse,
    PromotionUpdate,
)

router = APIRouter()


async def _get_manager_by_user(db: DbSession, user_id: UUID) -> Manager:
    """사용자 ID로 매니저 조회."""
    result = await db.execute(
        select(Manager).where(
            Manager.user_id == user_id,
            Manager.is_deleted == False,  # noqa: E712 - SQLAlchemy 비교 연산
        )
    )
    manager = result.scalar_one_or_none()

    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매니저 프로필을 찾을 수 없습니다.",
        )
    return manager


@router.get("/me", response_model=PromotionListResponse)
async def get_my_promotions(
    current_user: CurrentManager,
    db: DbSession,
) -> PromotionListResponse:
    """내 프로모션 목록 조회."""
    manager = await _get_manager_by_user(db, current_user.id)

    # 프로모션 목록 조회 (is_deleted=False만)
    result = await db.execute(
        select(Promotion)
        .where(
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
        .order_by(Promotion.created_at.desc())
    )
    promotions = result.scalars().all()

    # 총 개수
    count_result = await db.execute(
        select(func.count())
        .select_from(Promotion)
        .where(
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
    )
    total = count_result.scalar() or 0

    return PromotionListResponse(
        items=[PromotionResponse.model_validate(p) for p in promotions],
        total=total,
    )


@router.post("/me", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
async def create_promotion(
    data: PromotionCreate,
    current_user: CurrentManager,
    db: DbSession,
) -> PromotionResponse:
    """프로모션 생성."""
    manager = await _get_manager_by_user(db, current_user.id)

    promotion = Promotion(
        manager_id=manager.id,
        name=data.name,
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        target_type=data.target_type,
        target_service_type=data.target_service_type,
        start_date=data.start_date,
        end_date=data.end_date,
        max_usage=data.max_usage,
        created_by=current_user.id,  # coding-guide: 생성자 기록
    )

    db.add(promotion)
    await db.flush()
    await db.refresh(promotion)

    return PromotionResponse.model_validate(promotion)


@router.get("/me/{promotion_id}", response_model=PromotionResponse)
async def get_promotion(
    promotion_id: UUID,
    current_user: CurrentManager,
    db: DbSession,
) -> PromotionResponse:
    """프로모션 상세 조회."""
    manager = await _get_manager_by_user(db, current_user.id)

    result = await db.execute(
        select(Promotion).where(
            Promotion.id == promotion_id,
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
    )
    promotion = result.scalar_one_or_none()

    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로모션을 찾을 수 없습니다.",
        )

    return PromotionResponse.model_validate(promotion)


@router.patch("/me/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: UUID,
    data: PromotionUpdate,
    current_user: CurrentManager,
    db: DbSession,
) -> PromotionResponse:
    """프로모션 수정."""
    manager = await _get_manager_by_user(db, current_user.id)

    result = await db.execute(
        select(Promotion).where(
            Promotion.id == promotion_id,
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
    )
    promotion = result.scalar_one_or_none()

    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로모션을 찾을 수 없습니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(promotion, field, value)

    # coding-guide: 수정자 기록
    promotion.updated_by = current_user.id

    await db.flush()
    await db.refresh(promotion)

    return PromotionResponse.model_validate(promotion)


@router.delete("/me/{promotion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promotion(
    promotion_id: UUID,
    current_user: CurrentManager,
    db: DbSession,
) -> None:
    """프로모션 삭제 (Soft Delete)."""
    manager = await _get_manager_by_user(db, current_user.id)

    result = await db.execute(
        select(Promotion).where(
            Promotion.id == promotion_id,
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
    )
    promotion = result.scalar_one_or_none()

    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로모션을 찾을 수 없습니다.",
        )

    # coding-guide: Soft Delete 적용
    promotion.is_deleted = True
    promotion.updated_by = current_user.id
    await db.flush()


@router.patch("/me/{promotion_id}/toggle", response_model=PromotionResponse)
async def toggle_promotion_active(
    promotion_id: UUID,
    current_user: CurrentManager,
    db: DbSession,
) -> PromotionResponse:
    """프로모션 활성화/비활성화 토글."""
    manager = await _get_manager_by_user(db, current_user.id)

    result = await db.execute(
        select(Promotion).where(
            Promotion.id == promotion_id,
            Promotion.manager_id == manager.id,
            Promotion.is_deleted == False,  # noqa: E712
        )
    )
    promotion = result.scalar_one_or_none()

    if not promotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로모션을 찾을 수 없습니다.",
        )

    promotion.is_active = not promotion.is_active
    promotion.updated_by = current_user.id  # coding-guide: 수정자 기록
    await db.flush()
    await db.refresh(promotion)

    return PromotionResponse.model_validate(promotion)
