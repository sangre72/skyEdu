"""시스템 설정 스키마."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class SystemSettingBase(BaseModel):
    """시스템 설정 기본 스키마."""

    key: str = Field(..., max_length=100, description="설정 키")
    name: str = Field(..., max_length=200, description="설정 이름")
    description: Optional[str] = Field(None, description="설명")
    category: str = Field(..., max_length=50, description="카테고리")
    value: Optional[Any] = Field(None, description="설정값")
    default_value: Optional[Any] = Field(None, description="기본값")
    is_enabled: bool = Field(True, description="활성화 여부")
    is_readonly: bool = Field(False, description="읽기 전용 여부")


class SystemSettingCreate(SystemSettingBase):
    """시스템 설정 생성 스키마."""

    pass


class SystemSettingUpdate(BaseModel):
    """시스템 설정 수정 스키마."""

    name: Optional[str] = Field(None, max_length=200, description="설정 이름")
    description: Optional[str] = Field(None, description="설명")
    value: Optional[Any] = Field(None, description="설정값")
    is_enabled: Optional[bool] = Field(None, description="활성화 여부")


class SystemSettingResponse(SystemSettingBase):
    """시스템 설정 응답 스키마."""

    id: int = Field(..., description="ID")
    effective_value: Any = Field(..., description="유효 값 (value 또는 default_value)")
    created_at: datetime = Field(..., description="생성일")
    updated_at: datetime = Field(..., description="수정일")

    model_config = ConfigDict(from_attributes=True)


class FeatureFlagUpdate(BaseModel):
    """기능 플래그 토글 스키마."""

    is_enabled: bool = Field(..., description="활성화 여부")


class SystemSettingsBulkUpdate(BaseModel):
    """시스템 설정 일괄 수정 스키마."""

    settings: dict[str, Any] = Field(..., description="설정 키-값 매핑")
