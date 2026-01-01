"""결제 API 엔드포인트."""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentAdmin, CurrentUser, DbSession
from app.models.payment import Payment, PaymentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import UserRole
from app.schemas.payment import (
    PaymentConfirm,
    PaymentCreate,
    PaymentListResponse,
    PaymentResponse,
    RefundRequest,
)

router = APIRouter()


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> PaymentResponse:
    """결제 생성 (결제 준비)."""
    # 예약 확인
    result = await db.execute(
        select(Reservation).where(Reservation.id == data.reservation_id)
    )
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 권한 확인
    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 예약만 결제할 수 있습니다.",
        )

    # 이미 결제가 있는지 확인
    existing_result = await db.execute(
        select(Payment).where(Payment.reservation_id == data.reservation_id)
    )
    existing = existing_result.scalar_one_or_none()

    if existing and existing.status == PaymentStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 결제가 완료되었습니다.",
        )

    # 기존 대기 결제가 있으면 취소
    if existing and existing.status == PaymentStatus.PENDING.value:
        existing.status = PaymentStatus.CANCELLED.value

    payment = Payment(
        reservation_id=data.reservation_id,
        amount=data.amount,
        method=data.method,
        status=PaymentStatus.PENDING.value,
    )

    db.add(payment)
    await db.flush()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/confirm", response_model=PaymentResponse)
async def confirm_payment(
    payment_id: UUID,
    data: PaymentConfirm,
    current_user: CurrentUser,
    db: DbSession,
) -> PaymentResponse:
    """결제 확인 (PG 응답 처리)."""
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="결제를 찾을 수 없습니다.",
        )

    if payment.status != PaymentStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="대기 중인 결제만 확인할 수 있습니다.",
        )

    # 금액 확인
    if payment.amount != data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="결제 금액이 일치하지 않습니다.",
        )

    # TODO: PG사 결제 확인 API 호출
    # toss_client.confirm_payment(data.payment_key, data.order_id, data.amount)

    payment.status = PaymentStatus.COMPLETED.value
    payment.paid_at = datetime.now(timezone.utc)

    # 예약 상태 업데이트
    reservation_result = await db.execute(
        select(Reservation).where(Reservation.id == payment.reservation_id)
    )
    reservation = reservation_result.scalar_one_or_none()
    if reservation and reservation.status == ReservationStatus.PENDING.value:
        reservation.status = ReservationStatus.CONFIRMED.value

    await db.flush()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: UUID,
    data: RefundRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> PaymentResponse:
    """결제 환불 요청."""
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="결제를 찾을 수 없습니다.",
        )

    # 예약 조회
    reservation_result = await db.execute(
        select(Reservation).where(Reservation.id == payment.reservation_id)
    )
    reservation = reservation_result.scalar_one_or_none()

    # 권한 확인
    if current_user.role != UserRole.ADMIN.value:
        if reservation and reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    if payment.status != PaymentStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="완료된 결제만 환불할 수 있습니다.",
        )

    # TODO: PG사 환불 API 호출
    # refund_amount = data.refund_amount or payment.amount
    # toss_client.refund_payment(payment_key, refund_amount, data.reason)

    payment.status = PaymentStatus.REFUNDED.value
    payment.refunded_at = datetime.now(timezone.utc)

    # 예약 상태 업데이트
    if reservation:
        reservation.status = ReservationStatus.CANCELLED.value

    await db.flush()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> PaymentResponse:
    """결제 상세 조회."""
    result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = result.scalar_one_or_none()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="결제를 찾을 수 없습니다.",
        )

    # 예약 조회
    reservation_result = await db.execute(
        select(Reservation).where(Reservation.id == payment.reservation_id)
    )
    reservation = reservation_result.scalar_one_or_none()

    # 권한 확인
    if current_user.role != UserRole.ADMIN.value:
        if reservation and reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    return PaymentResponse.model_validate(payment)


@router.get("/reservation/{reservation_id}", response_model=PaymentResponse | None)
async def get_payment_by_reservation(
    reservation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> PaymentResponse | None:
    """예약별 결제 조회."""
    # 예약 조회
    reservation_result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = reservation_result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예약을 찾을 수 없습니다.",
        )

    # 권한 확인
    if current_user.role != UserRole.ADMIN.value:
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="접근 권한이 없습니다.",
            )

    result = await db.execute(
        select(Payment)
        .where(Payment.reservation_id == reservation_id)
        .order_by(Payment.created_at.desc())
    )
    payment = result.scalar_one_or_none()

    if not payment:
        return None

    return PaymentResponse.model_validate(payment)


@router.get("/", response_model=PaymentListResponse)
async def get_payments(
    current_user: CurrentAdmin,
    db: DbSession,
    skip: int = 0,
    limit: int = 20,
    status_filter: str | None = None,
) -> PaymentListResponse:
    """결제 목록 조회 (관리자 전용)."""
    from sqlalchemy import func

    query = select(Payment)

    if status_filter:
        query = query.where(Payment.status == status_filter)

    # 총 개수
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    payments = result.scalars().all()

    return PaymentListResponse(
        items=[PaymentResponse.model_validate(p) for p in payments],
        total=total,
    )
