"""리뷰 API 엔드포인트."""
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from app.api.deps import CurrentUser, DbSession
from app.models.reservation import Reservation, ReservationStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.review import (
    ReviewCreate,
    ReviewListResponse,
    ReviewResponse,
    ReviewStats,
    ReviewUpdate,
)

router = APIRouter()


def _build_review_response(review: Review) -> ReviewResponse:
    """리뷰 응답 객체 생성."""
    return ReviewResponse(
        id=review.id,
        reservation_id=review.reservation_id,
        user_id=review.user_id,
        manager_id=review.manager_id,
        rating=review.rating,
        content=review.content,
        created_at=review.created_at,
        updated_at=review.updated_at,
        user_name=review.user.name if review.user else None,
    )


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    data: ReviewCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> ReviewResponse:
    """리뷰 작성."""
    # 예약 확인
    result = await db.execute(
        select(Reservation).where(Reservation.id == data.reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 본인 예약인지 확인
    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 예약만 리뷰할 수 있습니다.",
        )

    # 완료된 예약인지 확인
    if reservation.status != ReservationStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="완료된 예약만 리뷰할 수 있습니다.",
        )

    # 매니저가 배정되었는지 확인
    if not reservation.manager_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="매니저가 배정되지 않은 예약입니다.",
        )

    # 이미 리뷰가 있는지 확인
    existing_result = await db.execute(
        select(Review).where(Review.reservation_id == data.reservation_id)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 리뷰가 작성되었습니다.",
        )

    review = Review(
        reservation_id=data.reservation_id,
        user_id=current_user.id,
        manager_id=reservation.manager_id,
        rating=data.rating,
        content=data.content,
    )

    db.add(review)
    await db.flush()
    await db.refresh(review, ["user"])

    return _build_review_response(review)


@router.get("/", response_model=ReviewListResponse)
async def get_reviews(
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    manager_id: UUID | None = None,
) -> ReviewListResponse:
    """리뷰 목록 조회."""
    query = select(Review).options(joinedload(Review.user))

    if manager_id:
        query = query.where(Review.manager_id == manager_id)

    # 총 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 페이지네이션
    offset = (page - 1) * limit
    query = query.order_by(Review.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    reviews = result.scalars().unique().all()

    return ReviewListResponse(
        items=[_build_review_response(r) for r in reviews],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/stats/{manager_id}", response_model=ReviewStats)
async def get_review_stats(
    manager_id: UUID,
    db: DbSession,
) -> ReviewStats:
    """매니저 리뷰 통계."""
    # 기본 통계
    stats_result = await db.execute(
        select(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg"),
        ).where(Review.manager_id == manager_id)
    )
    stats = stats_result.first()

    # 평점 분포
    dist_result = await db.execute(
        select(Review.rating, func.count(Review.id))
        .where(Review.manager_id == manager_id)
        .group_by(Review.rating)
    )
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating, count in dist_result.all():
        distribution[rating] = count

    return ReviewStats(
        total_reviews=stats.count if stats else 0,
        average_rating=float(stats.avg or 0),
        rating_distribution=distribution,
    )


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: UUID,
    db: DbSession,
) -> ReviewResponse:
    """리뷰 상세 조회."""
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.user))
        .where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리뷰를 찾을 수 없습니다.",
        )

    return _build_review_response(review)


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: UUID,
    data: ReviewUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ReviewResponse:
    """리뷰 수정."""
    result = await db.execute(
        select(Review)
        .options(joinedload(Review.user))
        .where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리뷰를 찾을 수 없습니다.",
        )

    # 권한 확인
    if review.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="접근 권한이 없습니다.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    await db.flush()
    await db.refresh(review)

    return _build_review_response(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """리뷰 삭제."""
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리뷰를 찾을 수 없습니다.",
        )

    # 권한 확인
    if review.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="접근 권한이 없습니다.",
        )

    await db.delete(review)
    await db.flush()
