"""결제 스키마."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    """결제 기본 스키마."""

    amount: Decimal = Field(ge=0)
    method: str = Field(pattern="^(card|bank_transfer|kakao_pay|naver_pay)$")


class PaymentCreate(PaymentBase):
    """결제 생성 스키마."""

    reservation_id: UUID


class PaymentResponse(BaseModel):
    """결제 응답 스키마."""

    id: UUID
    reservation_id: UUID
    amount: Decimal
    method: str
    status: str
    paid_at: Optional[datetime]
    refunded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentConfirm(BaseModel):
    """결제 확인 스키마 (PG 연동용)."""

    payment_key: str
    order_id: str
    amount: Decimal


class RefundRequest(BaseModel):
    """환불 요청 스키마."""

    reason: Optional[str] = None
    refund_amount: Optional[Decimal] = None  # None이면 전액 환불


class PaymentListResponse(BaseModel):
    """결제 목록 응답 스키마."""

    items: list[PaymentResponse]
    total: int
