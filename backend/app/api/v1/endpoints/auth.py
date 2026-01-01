import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PhoneVerifyConfirm,
    PhoneVerifyRequest,
    PhoneVerifyResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()

# 임시 인증번호 저장소 (실제로는 Redis 사용)
# 형식: {phone: {"code": "123456", "expires_at": datetime, "verified": bool}}
_verification_codes: dict[str, dict] = {}

# 개발용 테스트 인증번호
DEV_VERIFICATION_CODE = "000000"


def _generate_verification_code() -> str:
    """6자리 인증번호 생성."""
    return f"{secrets.randbelow(1000000):06d}"


def _create_verification_token(phone: str) -> str:
    """휴대폰 인증 완료 토큰 생성."""
    return secrets.token_urlsafe(32)


@router.post("/send-code", response_model=PhoneVerifyResponse)
async def send_verification_code(
    data: PhoneVerifyRequest,
    db: AsyncSession = Depends(get_db),
) -> PhoneVerifyResponse:
    """휴대폰 인증번호 발송."""
    code = _generate_verification_code()
    expires_at = datetime.now() + timedelta(minutes=3)

    # 인증번호 저장 (실제로는 SMS 발송)
    _verification_codes[data.phone] = {
        "code": code,
        "expires_at": expires_at,
        "verified": False,
        "token": None,
    }

    # TODO: 실제 SMS 발송 로직
    # await sms_service.send(data.phone, f"인증번호: {code}")

    return PhoneVerifyResponse(
        success=True,
        message=f"인증번호가 발송되었습니다. (개발용: {DEV_VERIFICATION_CODE})",
    )


@router.post("/verify-code", response_model=PhoneVerifyResponse)
async def verify_code(
    data: PhoneVerifyConfirm,
    db: AsyncSession = Depends(get_db),
) -> PhoneVerifyResponse:
    """휴대폰 인증번호 확인."""
    stored = _verification_codes.get(data.phone)

    # 개발용 테스트 코드 허용
    if data.code == DEV_VERIFICATION_CODE:
        token = _create_verification_token(data.phone)
        _verification_codes[data.phone] = {
            "code": DEV_VERIFICATION_CODE,
            "expires_at": datetime.now() + timedelta(minutes=10),
            "verified": True,
            "token": token,
        }
        return PhoneVerifyResponse(
            success=True,
            message="인증이 완료되었습니다.",
            verification_token=token,
        )

    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="인증번호를 먼저 요청해주세요.",
        )

    if datetime.now() > stored["expires_at"]:
        del _verification_codes[data.phone]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="인증번호가 만료되었습니다. 다시 요청해주세요.",
        )

    if stored["code"] != data.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="인증번호가 일치하지 않습니다.",
        )

    # 인증 완료 토큰 발급
    token = _create_verification_token(data.phone)
    _verification_codes[data.phone]["verified"] = True
    _verification_codes[data.phone]["token"] = token
    _verification_codes[data.phone]["expires_at"] = datetime.now() + timedelta(minutes=10)

    return PhoneVerifyResponse(
        success=True,
        message="인증이 완료되었습니다.",
        verification_token=token,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """회원가입."""
    # 인증 토큰 확인
    stored = _verification_codes.get(data.phone)
    if not stored or not stored.get("verified") or stored.get("token") != data.verification_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="휴대폰 인증을 먼저 완료해주세요.",
        )

    if datetime.now() > stored["expires_at"]:
        del _verification_codes[data.phone]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="인증이 만료되었습니다. 다시 인증해주세요.",
        )

    # 휴대폰 번호 중복 확인
    result = await db.execute(select(User).where(User.phone == data.phone))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 휴대폰 번호입니다.",
        )

    # 사용자 생성
    user = User(
        phone=data.phone,
        name=data.name,
        role=data.role,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    # 인증 정보 삭제
    del _verification_codes[data.phone]

    # 토큰 생성
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """로그인 (휴대폰 인증)."""
    # 개발용 테스트 코드 허용
    if data.code != DEV_VERIFICATION_CODE:
        stored = _verification_codes.get(data.phone)

        if not stored:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="인증번호를 먼저 요청해주세요.",
            )

        if datetime.now() > stored["expires_at"]:
            del _verification_codes[data.phone]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="인증번호가 만료되었습니다. 다시 요청해주세요.",
            )

        if stored["code"] != data.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="인증번호가 일치하지 않습니다.",
            )

    # 사용자 조회
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="등록되지 않은 휴대폰 번호입니다. 회원가입을 먼저 진행해주세요.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비활성화된 계정입니다.",
        )

    # 인증 정보 삭제
    if data.phone in _verification_codes:
        del _verification_codes[data.phone]

    # 토큰 생성
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    """로그아웃."""
    return {"message": "로그아웃되었습니다."}
