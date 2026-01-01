import uuid
from datetime import date, time
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, ForeignKey, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.payment import Payment
    from app.models.review import Review
    from app.models.user import User


class ServiceType(str, Enum):
    FULL_CARE = "full_care"
    HOSPITAL_CARE = "hospital_care"
    SPECIAL_CARE = "special_care"


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Reservation(Base, TimestampMixin):
    """Reservation model."""

    __tablename__ = "reservations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    estimated_hours: Mapped[Decimal] = mapped_column(
        Numeric(3, 1),
        nullable=False,
    )
    hospital_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hospital_address: Mapped[str] = mapped_column(Text, nullable=False)
    hospital_department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pickup_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    special_requests: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=ReservationStatus.PENDING.value,
    )
    price: Mapped[Decimal] = mapped_column(Numeric(10, 0), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="reservations",
        foreign_keys=[user_id],
    )
    manager: Mapped[Optional["User"]] = relationship("User", foreign_keys=[manager_id])
    payment: Mapped[Optional["Payment"]] = relationship(
        "Payment",
        back_populates="reservation",
        uselist=False,
    )
    review: Mapped[Optional["Review"]] = relationship(
        "Review",
        back_populates="reservation",
        uselist=False,
    )
