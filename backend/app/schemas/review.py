"""리뷰 스키마."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    """리뷰 기본 스키마."""

    rating: int = Field(ge=1, le=5)
    content: Optional[str] = Field(max_length=1000, default=None)


class ReviewCreate(ReviewBase):
    """리뷰 생성 스키마."""

    reservation_id: UUID


class ReviewUpdate(BaseModel):
    """리뷰 수정 스키마."""

    rating: Optional[int] = Field(ge=1, le=5, default=None)
    content: Optional[str] = Field(max_length=1000, default=None)


class ReviewResponse(ReviewBase):
    """리뷰 응답 스키마."""

    id: UUID
    reservation_id: UUID
    user_id: UUID
    manager_id: UUID
    created_at: datetime
    updated_at: datetime

    # 작성자 정보
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """리뷰 목록 응답 스키마."""

    items: list[ReviewResponse]
    total: int
    page: int
    limit: int


class ReviewStats(BaseModel):
    """리뷰 통계 스키마."""

    total_reviews: int
    average_rating: float
    rating_distribution: dict[int, int]  # {1: 10, 2: 5, 3: 20, 4: 50, 5: 100}
