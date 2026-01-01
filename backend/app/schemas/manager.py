"""매니저(동행인) 스키마."""
from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ManagerBase(BaseModel):
    """매니저 기본 스키마."""

    introduction: Optional[str] = None
    certifications: list[str] = Field(default_factory=list)
    available_areas: list[str] = Field(default_factory=list)


class ManagerCreate(ManagerBase):
    """매니저 등록 스키마."""

    pass


class ManagerUpdate(BaseModel):
    """매니저 수정 스키마."""

    introduction: Optional[str] = None
    certifications: Optional[list[str]] = None
    available_areas: Optional[list[str]] = None
    profile_image: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None


class ManagerResponse(BaseModel):
    """매니저 응답 스키마."""

    id: UUID
    user_id: UUID
    status: str
    grade: str
    rating: Decimal
    total_services: int
    certifications: list[str]
    available_areas: list[str]
    introduction: Optional[str]
    profile_image: Optional[str]
    created_at: datetime

    # User 정보 포함
    name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class ManagerListResponse(BaseModel):
    """매니저 목록 응답 스키마."""

    items: list[ManagerResponse]
    total: int
    page: int
    limit: int


class ManagerDetailResponse(ManagerResponse):
    """매니저 상세 응답 스키마 (추가 정보 포함)."""

    reviews_count: int = 0
    avg_rating: Decimal = Decimal("0.0")


# Schedule 스키마
class ScheduleBase(BaseModel):
    """스케줄 기본 스키마."""

    date: date
    start_time: time
    end_time: time
    is_available: bool = True


class ScheduleCreate(ScheduleBase):
    """스케줄 생성 스키마."""

    pass


class ScheduleUpdate(BaseModel):
    """스케줄 수정 스키마."""

    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_available: Optional[bool] = None


class ScheduleResponse(ScheduleBase):
    """스케줄 응답 스키마."""

    id: UUID
    manager_id: UUID

    class Config:
        from_attributes = True
