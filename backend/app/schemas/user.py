from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """사용자 기본 스키마."""

    name: str
    phone: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    """사용자 생성 스키마."""

    password: Optional[str] = None


class UserUpdate(BaseModel):
    """사용자 수정 스키마."""

    name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    birth_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, pattern=r"^01[0-9]{8,9}$")


class UserResponse(BaseModel):
    """사용자 응답 스키마."""

    id: UUID
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """사용자 프로필 응답 스키마."""

    id: UUID
    user_id: UUID
    birth_date: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None

    class Config:
        from_attributes = True


class UserWithProfileResponse(UserResponse):
    """프로필 포함 사용자 응답 스키마."""

    profile: Optional[UserProfileResponse] = None
