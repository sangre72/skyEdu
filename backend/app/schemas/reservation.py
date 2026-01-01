from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReservationBase(BaseModel):
    """예약 기본 스키마."""

    service_type: str
    scheduled_date: date
    scheduled_time: time
    estimated_hours: Decimal = Field(ge=1, le=12)
    hospital_name: str = Field(max_length=200)
    hospital_address: str
    hospital_department: Optional[str] = None
    pickup_address: Optional[str] = None
    symptoms: Optional[str] = None
    special_requests: Optional[str] = None


class ReservationCreate(ReservationBase):
    """예약 생성 스키마."""

    manager_id: Optional[UUID] = None


class ReservationUpdate(BaseModel):
    """예약 수정 스키마."""

    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    special_requests: Optional[str] = None


class ReservationResponse(ReservationBase):
    """예약 응답 스키마."""

    id: UUID
    user_id: UUID
    manager_id: Optional[UUID]
    status: str
    price: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReservationListResponse(BaseModel):
    """예약 목록 응답 스키마."""

    items: list[ReservationResponse]
    total: int
    page: int
    limit: int
