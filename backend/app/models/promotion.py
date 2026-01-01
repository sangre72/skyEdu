"""프로모션/할인 모델."""
import uuid
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.manager import Manager


class DiscountType(str, Enum):
    """할인 유형."""

    PERCENT = "percent"
    FIXED = "fixed"


class DiscountTarget(str, Enum):
    """할인 대상."""

    ALL = "all"
    NEW_CUSTOMER = "new_customer"
    RETURNING = "returning"
    SPECIFIC_SERVICE = "specific_service"


class Promotion(Base, TimestampMixin):
    """프로모션 모델."""

    __tablename__ = "promotions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    manager_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("managers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    discount_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=DiscountType.PERCENT.value,
    )
    discount_value: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    target_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=DiscountTarget.ALL.value,
    )
    target_service_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    max_usage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    manager: Mapped["Manager"] = relationship("Manager", back_populates="promotions")
