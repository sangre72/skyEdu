import uuid
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.promotion import Promotion
    from app.models.user import User


class ManagerStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class ManagerGrade(str, Enum):
    NEW = "new"
    REGULAR = "regular"
    PREMIUM = "premium"


class Manager(Base, TimestampMixin):
    """Manager profile model."""

    __tablename__ = "managers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ManagerStatus.PENDING.value,
    )
    grade: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ManagerGrade.NEW.value,
    )
    rating: Mapped[float] = mapped_column(
        Numeric(2, 1),
        nullable=False,
        default=0.0,
    )
    total_services: Mapped[int] = mapped_column(nullable=False, default=0)
    certifications: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=[],
    )
    available_areas: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=[],
    )
    introduction: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bank_account: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_volunteer: Mapped[bool] = mapped_column(Boolean, default=False)  # 자원봉사자 여부 (봉사료 0원)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="manager_profile")
    schedules: Mapped[list["ManagerSchedule"]] = relationship(
        "ManagerSchedule",
        back_populates="manager",
        cascade="all, delete-orphan",
    )
    promotions: Mapped[list["Promotion"]] = relationship(
        "Promotion",
        back_populates="manager",
        cascade="all, delete-orphan",
    )


class ManagerSchedule(Base, TimestampMixin):
    """Manager schedule model."""

    __tablename__ = "manager_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    manager_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("managers.id", ondelete="CASCADE"),
        nullable=False,
    )
    date: Mapped[str] = mapped_column(Date, nullable=False)
    start_time: Mapped[str] = mapped_column(Time, nullable=False)
    end_time: Mapped[str] = mapped_column(Time, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    manager: Mapped["Manager"] = relationship("Manager", back_populates="schedules")
