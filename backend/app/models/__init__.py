"""Database models."""
from app.models.user import User, UserProfile, UserRole
from app.models.manager import Manager, ManagerSchedule, ManagerStatus, ManagerGrade
from app.models.reservation import Reservation, ServiceType, ReservationStatus
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.review import Review
from app.models.promotion import Promotion, DiscountType, DiscountTarget
from app.models.board import Board, BoardCategory, Post, Comment, Attachment

__all__ = [
    # User
    "User",
    "UserProfile",
    "UserRole",
    # Manager
    "Manager",
    "ManagerSchedule",
    "ManagerStatus",
    "ManagerGrade",
    # Reservation
    "Reservation",
    "ServiceType",
    "ReservationStatus",
    # Payment
    "Payment",
    "PaymentStatus",
    "PaymentMethod",
    # Review
    "Review",
    # Promotion
    "Promotion",
    "DiscountType",
    "DiscountTarget",
    # Board
    "Board",
    "BoardCategory",
    "Post",
    "Comment",
    "Attachment",
]
