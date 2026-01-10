"""관리자 API 엔드포인트."""
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentAdminOptional, DbSession
from app.models import SystemSetting, User
from app.schemas import (
    FeatureFlagUpdate,
    SystemSettingCreate,
    SystemSettingResponse,
    SystemSettingsBulkUpdate,
    SystemSettingUpdate,
)

router = APIRouter()


def get_user_id(user: User | None) -> UUID | None:
    """개발 모드에서는 None 반환, 프로덕션에서는 user.id 반환."""
    return user.id if user else None


@router.get("/settings", response_model=list[SystemSettingResponse])
async def get_all_settings(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    category: str | None = None,
) -> Any:
    """모든 시스템 설정 조회.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        category: 카테고리 필터 (선택)

    Returns:
        시스템 설정 목록
    """
    query = select(SystemSetting)
    if category:
        query = query.where(SystemSetting.category == category)

    result = await db.execute(query.order_by(SystemSetting.category, SystemSetting.key))
    settings = result.scalars().all()

    return settings


@router.get("/settings/{key}", response_model=SystemSettingResponse)
async def get_setting_by_key(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    key: str,
) -> Any:
    """특정 설정 조회.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        key: 설정 키

    Returns:
        시스템 설정

    Raises:
        HTTPException: 설정을 찾을 수 없는 경우 404
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting with key '{key}' not found",
        )

    return setting


@router.post("/settings", response_model=SystemSettingResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    setting_in: SystemSettingCreate,
) -> Any:
    """새 시스템 설정 생성.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        setting_in: 설정 생성 데이터

    Returns:
        생성된 시스템 설정

    Raises:
        HTTPException: 중복된 키인 경우 400
    """
    # 중복 키 체크
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == setting_in.key))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Setting with key '{setting_in.key}' already exists",
        )

    # 설정 생성
    user_id = get_user_id(current_user)
    setting = SystemSetting(
        **setting_in.model_dump(),
        created_by=user_id,
        updated_by=user_id,
    )

    db.add(setting)
    await db.commit()
    await db.refresh(setting)

    return setting


@router.patch("/settings/{key}", response_model=SystemSettingResponse)
async def update_setting(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    key: str,
    setting_in: SystemSettingUpdate,
) -> Any:
    """시스템 설정 수정.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        key: 설정 키
        setting_in: 설정 수정 데이터

    Returns:
        수정된 시스템 설정

    Raises:
        HTTPException: 설정을 찾을 수 없거나 읽기 전용인 경우
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting with key '{key}' not found",
        )

    if setting.is_readonly:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify read-only setting",
        )

    # 설정 수정
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)

    setting.updated_by = get_user_id(current_user)

    await db.commit()
    await db.refresh(setting)

    return setting


@router.patch("/settings/{key}/toggle", response_model=SystemSettingResponse)
async def toggle_feature_flag(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    key: str,
    flag_in: FeatureFlagUpdate,
) -> Any:
    """기능 플래그 토글.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        key: 설정 키
        flag_in: 활성화 여부

    Returns:
        수정된 시스템 설정

    Raises:
        HTTPException: 설정을 찾을 수 없거나 읽기 전용인 경우
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting with key '{key}' not found",
        )

    if setting.is_readonly:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify read-only setting",
        )

    setting.is_enabled = flag_in.is_enabled
    setting.updated_by = get_user_id(current_user)

    await db.commit()
    await db.refresh(setting)

    return setting


@router.post("/settings/bulk-update", response_model=list[SystemSettingResponse])
async def bulk_update_settings(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    bulk_in: SystemSettingsBulkUpdate,
) -> Any:
    """시스템 설정 일괄 수정.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        bulk_in: 설정 키-값 매핑

    Returns:
        수정된 시스템 설정 목록
    """
    updated_settings = []

    for key, value in bulk_in.settings.items():
        result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
        setting = result.scalar_one_or_none()

        if setting and not setting.is_readonly:
            if isinstance(value, dict) and "is_enabled" in value:
                setting.is_enabled = value["is_enabled"]
            else:
                setting.value = value

            setting.updated_by = get_user_id(current_user)
            updated_settings.append(setting)

    await db.commit()

    for setting in updated_settings:
        await db.refresh(setting)

    return updated_settings


@router.delete("/settings/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
    key: str,
) -> None:
    """시스템 설정 삭제.

    Args:
        db: DB 세션
        current_user: 관리자 사용자
        key: 설정 키

    Raises:
        HTTPException: 설정을 찾을 수 없거나 읽기 전용인 경우
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()

    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting with key '{key}' not found",
        )

    if setting.is_readonly:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete read-only setting",
        )

    await db.delete(setting)
    await db.commit()


@router.post("/settings/initialize", response_model=list[SystemSettingResponse])
async def initialize_default_settings(
    *,
    db: DbSession,
    current_user: CurrentAdminOptional,
) -> Any:
    """기본 시스템 설정 초기화.

    Args:
        db: DB 세션
        current_user: 관리자 사용자

    Returns:
        생성된 시스템 설정 목록
    """
    default_settings = [
        # 인증/회원
        {
            "key": "feature.auth.registration",
            "name": "회원가입 기능",
            "category": "auth",
            "description": "사용자 회원가입 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.auth.kakao_login",
            "name": "카카오 로그인",
            "category": "auth",
            "description": "카카오 소셜 로그인 기능",
            "is_enabled": False,
            "default_value": False,
        },
        # 예약
        {
            "key": "feature.reservation.create",
            "name": "예약 생성 기능",
            "category": "reservation",
            "description": "새 예약 생성 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.reservation.cancel",
            "name": "예약 취소 기능",
            "category": "reservation",
            "description": "예약 취소 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.reservation.urgent",
            "name": "긴급 예약 기능",
            "category": "reservation",
            "description": "당일 긴급 예약 기능",
            "is_enabled": True,
            "default_value": True,
        },
        # 결제
        {
            "key": "feature.payment.enabled",
            "name": "결제 기능",
            "category": "payment",
            "description": "결제 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.payment.refund",
            "name": "환불 기능",
            "category": "payment",
            "description": "환불 처리 기능",
            "is_enabled": True,
            "default_value": True,
        },
        # 매니저
        {
            "key": "feature.manager.registration",
            "name": "매니저 등록 기능",
            "category": "manager",
            "description": "새 매니저 등록 신청 기능",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.manager.schedule",
            "name": "매니저 일정 관리",
            "category": "manager",
            "description": "매니저 일정 설정 기능",
            "is_enabled": True,
            "default_value": True,
        },
        # 프로모션
        {
            "key": "feature.promotion.enabled",
            "name": "프로모션 기능",
            "category": "promotion",
            "description": "할인/프로모션 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        # 리뷰
        {
            "key": "feature.review.write",
            "name": "리뷰 작성 기능",
            "category": "review",
            "description": "리뷰 작성 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        # 게시판
        {
            "key": "feature.board.enabled",
            "name": "게시판 기능",
            "category": "board",
            "description": "게시판 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        # 알림
        {
            "key": "feature.notification.sms",
            "name": "SMS 알림",
            "category": "notification",
            "description": "SMS 알림 발송 기능",
            "is_enabled": False,
            "default_value": False,
        },
        {
            "key": "feature.notification.push",
            "name": "푸시 알림",
            "category": "notification",
            "description": "푸시 알림 기능",
            "is_enabled": False,
            "default_value": False,
        },
        # 시스템
        {
            "key": "system.maintenance_mode",
            "name": "점검 모드",
            "category": "system",
            "description": "시스템 점검 모드 (모든 서비스 중단)",
            "is_enabled": False,
            "default_value": False,
        },
    ]

    created_settings = []

    for setting_data in default_settings:
        # 이미 존재하는지 확인
        result = await db.execute(
            select(SystemSetting).where(SystemSetting.key == setting_data["key"])
        )
        existing = result.scalar_one_or_none()

        if not existing:
            user_id = get_user_id(current_user)
            setting = SystemSetting(
                **setting_data,
                created_by=user_id,
                updated_by=user_id,
            )
            db.add(setting)
            created_settings.append(setting)

    await db.commit()

    for setting in created_settings:
        await db.refresh(setting)

    return created_settings
