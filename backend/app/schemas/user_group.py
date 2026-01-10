from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserGroupBase(BaseModel):
    """User Group base schema."""

    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None


class UserGroupCreate(UserGroupBase):
    """User Group create schema."""

    pass


class UserGroupUpdate(BaseModel):
    """User Group update schema."""

    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class UserGroupResponse(UserGroupBase):
    """User Group response schema."""

    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True}
