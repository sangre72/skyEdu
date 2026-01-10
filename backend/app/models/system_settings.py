"""시스템 설정 모델."""
from datetime import datetime
from enum import Enum
from typing import Any

from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class FeatureCategory(str, Enum):
    """기능 카테고리."""

    AUTH = "auth"  # 인증/회원
    RESERVATION = "reservation"  # 예약
    PAYMENT = "payment"  # 결제
    MANAGER = "manager"  # 매니저
    PROMOTION = "promotion"  # 프로모션
    REVIEW = "review"  # 리뷰
    BOARD = "board"  # 게시판
    NOTIFICATION = "notification"  # 알림
    SYSTEM = "system"  # 시스템


class SystemSetting(Base):
    """시스템 설정 모델.

    기능 플래그, 설정값 등을 관리하는 테이블.
    """

    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)

    # 설정 키 (고유값)
    key = Column(String(100), unique=True, nullable=False, index=True)

    # 설정 이름
    name = Column(String(200), nullable=False)

    # 설명
    description = Column(Text, nullable=True)

    # 카테고리
    category = Column(String(50), nullable=False, index=True)

    # 설정값 (JSON)
    value = Column(JSON, nullable=True)

    # 기본값 (JSON)
    default_value = Column(JSON, nullable=True)

    # 활성화 여부 (기능 플래그용)
    is_enabled = Column(Boolean, default=True, nullable=False)

    # 관리자만 수정 가능
    is_readonly = Column(Boolean, default=False, nullable=False)

    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    def __repr__(self) -> str:
        return f"<SystemSetting {self.key}={self.value}>"

    @property
    def effective_value(self) -> Any:
        """유효 값 반환 (value가 None이면 default_value 반환)."""
        return self.value if self.value is not None else self.default_value
