"""프로모션/할인 스키마."""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class PromotionBase(BaseModel):
    """프로모션 기본 스키마."""

    name: str = Field(max_length=100)
    description: Optional[str] = None
    discount_type: str = Field(pattern="^(percent|fixed)$")
    discount_value: Decimal = Field(ge=0)
    target_type: str = Field(pattern="^(all|new_customer|returning|specific_service)$")
    target_service_type: Optional[str] = None
    start_date: date
    end_date: date
    max_usage: Optional[int] = Field(ge=1, default=None)

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: Decimal, info) -> Decimal:
        """할인값 검증."""
        # percent인 경우 0-100 사이
        discount_type = info.data.get("discount_type")
        if discount_type == "percent" and v > 100:
            raise ValueError("정률 할인은 100%를 초과할 수 없습니다.")
        return v

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date, info) -> date:
        """종료일 검증."""
        start_date = info.data.get("start_date")
        if start_date and v < start_date:
            raise ValueError("종료일은 시작일보다 이후여야 합니다.")
        return v


class PromotionCreate(PromotionBase):
    """프로모션 생성 스키마."""

    pass


class PromotionUpdate(BaseModel):
    """프로모션 수정 스키마."""

    name: Optional[str] = Field(max_length=100, default=None)
    description: Optional[str] = None
    discount_type: Optional[str] = Field(pattern="^(percent|fixed)$", default=None)
    discount_value: Optional[Decimal] = Field(ge=0, default=None)
    target_type: Optional[str] = None
    target_service_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    max_usage: Optional[int] = Field(ge=1, default=None)
    is_active: Optional[bool] = None


class PromotionResponse(BaseModel):
    """프로모션 응답 스키마."""

    id: UUID
    manager_id: UUID
    name: str
    description: Optional[str]
    discount_type: str
    discount_value: Decimal
    target_type: str
    target_service_type: Optional[str]
    start_date: date
    end_date: date
    max_usage: Optional[int]
    used_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PromotionListResponse(BaseModel):
    """프로모션 목록 응답 스키마."""

    items: list[PromotionResponse]
    total: int
