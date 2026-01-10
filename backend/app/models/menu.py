"""Menu model for admin menu management."""
import uuid
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class MenuType(str, Enum):
    """메뉴 타입."""

    SITE = "site"
    USER = "user"
    ADMIN = "admin"
    HEADER_UTILITY = "header_utility"
    FOOTER_UTILITY = "footer_utility"
    QUICK_MENU = "quick_menu"


class LinkType(str, Enum):
    """링크 타입."""

    URL = "url"
    NEW_WINDOW = "new_window"
    MODAL = "modal"
    EXTERNAL = "external"
    NONE = "none"


class PermissionType(str, Enum):
    """권한 타입."""

    PUBLIC = "public"
    MEMBER = "member"
    GROUPS = "groups"
    USERS = "users"
    ROLES = "roles"
    ADMIN = "admin"


class Menu(Base, TimestampMixin):
    """메뉴 모델 - 관리자 메뉴 관리 시스템."""

    __tablename__ = "menus"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # 메뉴 타입
    menu_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        default=MenuType.ADMIN.value,
    )

    # 트리 구조
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("menus.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    depth: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    path: Mapped[str] = mapped_column(String(500), default="", nullable=False)

    # 기본 정보
    menu_name: Mapped[str] = mapped_column(String(100), nullable=False)
    menu_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # 연동 설정
    link_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=LinkType.URL.value,
    )
    link_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    external_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    # 권한 설정
    permission_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=PermissionType.ADMIN.value,
    )

    # 기능 연결 (Feature Flag)
    feature_key: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True,
        comment="연결된 기능 키 (예: feature.auth.login). 해당 기능이 비활성화되면 메뉴도 숨김",
    )

    # 상태
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_expandable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    default_expanded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    parent: Mapped[Optional["Menu"]] = relationship(
        "Menu",
        remote_side=[id],
        back_populates="children",
    )
    children: Mapped[list["Menu"]] = relationship(
        "Menu",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="Menu.sort_order",
    )

    def __repr__(self) -> str:
        """메뉴 문자열 표현."""
        return f"<Menu(id={self.id}, name={self.menu_name}, type={self.menu_type})>"
