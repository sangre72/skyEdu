"""시스템 설정 초기화 스크립트."""
import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db.session import async_session_maker
from app.models import SystemSetting


async def init_settings():
    """기본 시스템 설정 초기화."""
    default_settings = [
        # 인증/회원
        {
            "key": "feature.auth.login",
            "name": "로그인 기능",
            "category": "auth",
            "description": "사용자 로그인 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.auth.registration",
            "name": "회원가입 기능",
            "category": "auth",
            "description": "사용자 회원가입 기능 활성화",
            "is_enabled": True,
            "default_value": True,
        },
        {
            "key": "feature.auth.phone_verification",
            "name": "휴대폰 인증",
            "category": "auth",
            "description": "휴대폰 인증 기능 (회원가입/로그인 시)",
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
        {
            "key": "feature.auth.password_reset",
            "name": "비밀번호 재설정",
            "category": "auth",
            "description": "비밀번호 찾기/재설정 기능",
            "is_enabled": True,
            "default_value": True,
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

    async with async_session_maker() as db:
        created_count = 0
        updated_count = 0

        for setting_data in default_settings:
            # 이미 존재하는지 확인
            result = await db.execute(
                select(SystemSetting).where(SystemSetting.key == setting_data["key"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                setting = SystemSetting(**setting_data)
                db.add(setting)
                created_count += 1
                print(f"✓ 생성: {setting_data['name']} ({setting_data['key']})")
            else:
                # 기존 설정 업데이트 (is_enabled는 유지)
                existing.name = setting_data["name"]
                existing.description = setting_data.get("description")
                existing.default_value = setting_data.get("default_value")
                updated_count += 1
                print(f"↻ 업데이트: {setting_data['name']} ({setting_data['key']})")

        await db.commit()

        print(f"\n완료! 생성: {created_count}개, 업데이트: {updated_count}개")


if __name__ == "__main__":
    print("시스템 설정 초기화 중...\n")
    asyncio.run(init_settings())
