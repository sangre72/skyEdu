"""예약 서비스."""
from datetime import date, time
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.manager import Manager, ManagerSchedule
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.services.price import PriceService


class ReservationService:
    """예약 비즈니스 로직 서비스."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_manager_availability(
        self,
        manager_id: UUID,
        scheduled_date: date,
        scheduled_time: time,
        estimated_hours: Decimal,
    ) -> bool:
        """매니저 예약 가능 여부 확인."""
        # 매니저 조회
        result = await self.db.execute(
            select(Manager).where(Manager.user_id == manager_id)
        )
        manager = result.scalar_one_or_none()

        if not manager:
            return False

        # 해당 날짜 스케줄 확인
        schedule_result = await self.db.execute(
            select(ManagerSchedule).where(
                ManagerSchedule.manager_id == manager.id,
                ManagerSchedule.date == scheduled_date,
                ManagerSchedule.is_available == True,  # noqa: E712
            )
        )
        schedules = schedule_result.scalars().all()

        # 스케줄이 없으면 불가능
        if not schedules:
            return False

        # 요청 시간대가 가능한 스케줄과 겹치는지 확인
        # TODO: 시간 겹침 계산 로직 고도화 필요
        for schedule in schedules:
            if schedule.start_time <= scheduled_time < schedule.end_time:
                return True

        return False

    async def check_conflicting_reservations(
        self,
        manager_id: UUID,
        scheduled_date: date,
        scheduled_time: time,
        estimated_hours: Decimal,
        exclude_reservation_id: Optional[UUID] = None,
    ) -> bool:
        """중복 예약 확인."""
        query = select(Reservation).where(
            Reservation.manager_id == manager_id,
            Reservation.scheduled_date == scheduled_date,
            Reservation.status.in_([
                ReservationStatus.PENDING.value,
                ReservationStatus.CONFIRMED.value,
                ReservationStatus.IN_PROGRESS.value,
            ]),
        )

        if exclude_reservation_id:
            query = query.where(Reservation.id != exclude_reservation_id)

        result = await self.db.execute(query)
        existing_reservations = result.scalars().all()

        # TODO: 시간 겹침 계산 로직 고도화 필요
        for reservation in existing_reservations:
            # 간단한 중복 체크 (같은 시간대)
            if reservation.scheduled_time == scheduled_time:
                return True

        return False

    async def find_available_managers(
        self,
        scheduled_date: date,
        scheduled_time: time,
        area: Optional[str] = None,
        service_type: Optional[str] = None,
    ) -> list[Manager]:
        """예약 가능한 매니저 목록 조회."""
        from app.models.manager import ManagerStatus

        # 활성 매니저 조회
        query = select(Manager).where(Manager.status == ManagerStatus.ACTIVE.value)

        # 지역 필터
        if area:
            query = query.where(Manager.available_areas.contains([area]))

        result = await self.db.execute(query)
        managers = result.scalars().all()

        # 가능한 매니저 필터링
        available_managers = []
        for manager in managers:
            # 스케줄 확인
            is_available = await self.check_manager_availability(
                manager.user_id,
                scheduled_date,
                scheduled_time,
                Decimal("2"),  # 기본 2시간으로 체크
            )

            if not is_available:
                continue

            # 중복 예약 확인
            has_conflict = await self.check_conflicting_reservations(
                manager.user_id,
                scheduled_date,
                scheduled_time,
                Decimal("2"),
            )

            if not has_conflict:
                available_managers.append(manager)

        return available_managers

    async def create_reservation(
        self,
        user: User,
        service_type: str,
        scheduled_date: date,
        scheduled_time: time,
        estimated_hours: Decimal,
        hospital_name: str,
        hospital_address: str,
        hospital_department: Optional[str] = None,
        pickup_address: Optional[str] = None,
        symptoms: Optional[str] = None,
        special_requests: Optional[str] = None,
        manager_id: Optional[UUID] = None,
    ) -> Reservation:
        """예약 생성."""
        # 가격 계산
        price_info = PriceService.calculate_total_price(
            service_type=service_type,
            estimated_hours=estimated_hours,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
        )

        reservation = Reservation(
            user_id=user.id,
            manager_id=manager_id,
            service_type=service_type,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            estimated_hours=estimated_hours,
            hospital_name=hospital_name,
            hospital_address=hospital_address,
            hospital_department=hospital_department,
            pickup_address=pickup_address,
            symptoms=symptoms,
            special_requests=special_requests,
            price=price_info["total"],
            status=ReservationStatus.PENDING.value,
        )

        self.db.add(reservation)
        await self.db.flush()
        await self.db.refresh(reservation)

        return reservation

    async def assign_manager(
        self,
        reservation: Reservation,
        manager_id: UUID,
    ) -> Reservation:
        """매니저 배정."""
        # 가용성 확인
        is_available = await self.check_manager_availability(
            manager_id,
            reservation.scheduled_date,
            reservation.scheduled_time,
            reservation.estimated_hours,
        )

        if not is_available:
            raise ValueError("해당 매니저는 요청된 시간에 예약이 불가능합니다.")

        # 중복 확인
        has_conflict = await self.check_conflicting_reservations(
            manager_id,
            reservation.scheduled_date,
            reservation.scheduled_time,
            reservation.estimated_hours,
            exclude_reservation_id=reservation.id,
        )

        if has_conflict:
            raise ValueError("해당 매니저는 이미 다른 예약이 있습니다.")

        reservation.manager_id = manager_id
        reservation.status = ReservationStatus.CONFIRMED.value

        await self.db.flush()
        await self.db.refresh(reservation)

        return reservation

    async def cancel_reservation(
        self,
        reservation: Reservation,
        reason: Optional[str] = None,
    ) -> Reservation:
        """예약 취소."""
        if reservation.status in [
            ReservationStatus.COMPLETED.value,
            ReservationStatus.CANCELLED.value,
        ]:
            raise ValueError("취소할 수 없는 예약 상태입니다.")

        reservation.status = ReservationStatus.CANCELLED.value

        # TODO: 환불 처리 로직
        # TODO: 취소 사유 저장 (별도 테이블 또는 필드 필요)

        await self.db.flush()
        await self.db.refresh(reservation)

        return reservation
