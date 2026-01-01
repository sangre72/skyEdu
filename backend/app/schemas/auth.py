from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PhoneVerifyRequest(BaseModel):
    """휴대폰 인증번호 발송 요청."""

    phone: str = Field(pattern=r"^01[0-9]{8,9}$")


class PhoneVerifyConfirm(BaseModel):
    """휴대폰 인증번호 확인 요청."""

    phone: str = Field(pattern=r"^01[0-9]{8,9}$")
    code: str = Field(min_length=6, max_length=6)


class PhoneVerifyResponse(BaseModel):
    """휴대폰 인증 응답."""

    success: bool
    message: str
    verification_token: Optional[str] = None  # 인증 성공 시 발급


class RegisterRequest(BaseModel):
    """회원가입 요청 스키마."""

    phone: str = Field(pattern=r"^01[0-9]{8,9}$")
    name: str = Field(min_length=2, max_length=50)
    role: Literal["customer", "companion"] = "customer"
    verification_token: str  # 휴대폰 인증 완료 토큰


class LoginRequest(BaseModel):
    """로그인 요청 스키마 (휴대폰 인증)."""

    phone: str = Field(pattern=r"^01[0-9]{8,9}$")
    code: str = Field(min_length=6, max_length=6)


class UserResponse(BaseModel):
    """사용자 정보 응답."""

    id: UUID
    phone: str
    name: str
    role: str
    is_verified: bool
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """토큰 응답 스키마."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """토큰 갱신 요청 스키마."""

    refresh_token: str
