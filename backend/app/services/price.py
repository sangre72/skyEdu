"""가격 계산 서비스."""
from datetime import date, time
from decimal import Decimal

from app.models.reservation import ServiceType


class PriceService:
    """가격 계산 서비스."""

    # 서비스 타입별 시간당 기본 가격
    BASE_PRICES: dict[str, Decimal] = {
        ServiceType.FULL_CARE.value: Decimal("35000"),
        ServiceType.HOSPITAL_CARE.value: Decimal("25000"),
        ServiceType.SPECIAL_CARE.value: Decimal("50000"),
    }

    # 추가 요금 설정
    EXTRA_DISTANCE_THRESHOLD = 10  # km
    EXTRA_DISTANCE_RATE = Decimal("500")  # per km
    URGENT_SURCHARGE_RATE = Decimal("0.5")  # 50%
    NIGHT_WEEKEND_SURCHARGE_RATE = Decimal("0.3")  # 30%

    @classmethod
    def calculate_base_price(
        cls,
        service_type: str,
        estimated_hours: Decimal,
    ) -> Decimal:
        """기본 서비스 가격 계산."""
        base_price = cls.BASE_PRICES.get(service_type, Decimal("25000"))
        return base_price * estimated_hours

    @classmethod
    def calculate_distance_surcharge(
        cls,
        distance_km: float,
    ) -> Decimal:
        """거리 추가 요금 계산."""
        if distance_km <= cls.EXTRA_DISTANCE_THRESHOLD:
            return Decimal("0")

        extra_km = Decimal(str(distance_km - cls.EXTRA_DISTANCE_THRESHOLD))
        return extra_km * cls.EXTRA_DISTANCE_RATE

    @classmethod
    def is_urgent(cls, scheduled_date: date) -> bool:
        """당일 예약(긴급) 여부 확인."""
        return scheduled_date == date.today()

    @classmethod
    def is_night_or_weekend(
        cls,
        scheduled_date: date,
        scheduled_time: time,
    ) -> bool:
        """야간/주말 여부 확인."""
        # 주말 (토: 5, 일: 6)
        if scheduled_date.weekday() >= 5:
            return True

        # 야간 (18시 이후 또는 8시 이전)
        if scheduled_time.hour >= 18 or scheduled_time.hour < 8:
            return True

        return False

    @classmethod
    def calculate_total_price(
        cls,
        service_type: str,
        estimated_hours: Decimal,
        scheduled_date: date,
        scheduled_time: time,
        distance_km: float = 0,
        discount_amount: Decimal = Decimal("0"),
    ) -> dict[str, Decimal]:
        """총 가격 계산."""
        # 기본 가격
        base_price = cls.calculate_base_price(service_type, estimated_hours)

        # 거리 추가 요금
        distance_surcharge = cls.calculate_distance_surcharge(distance_km)

        # 긴급 추가 요금
        urgent_surcharge = Decimal("0")
        if cls.is_urgent(scheduled_date):
            urgent_surcharge = base_price * cls.URGENT_SURCHARGE_RATE

        # 야간/주말 추가 요금
        night_weekend_surcharge = Decimal("0")
        if cls.is_night_or_weekend(scheduled_date, scheduled_time):
            night_weekend_surcharge = base_price * cls.NIGHT_WEEKEND_SURCHARGE_RATE

        # 소계
        subtotal = base_price + distance_surcharge + urgent_surcharge + night_weekend_surcharge

        # 할인 적용
        total = max(subtotal - discount_amount, Decimal("0"))

        return {
            "base_price": base_price,
            "distance_surcharge": distance_surcharge,
            "urgent_surcharge": urgent_surcharge,
            "night_weekend_surcharge": night_weekend_surcharge,
            "subtotal": subtotal,
            "discount_amount": discount_amount,
            "total": total,
        }

    @classmethod
    def calculate_manager_revenue(
        cls,
        total_price: Decimal,
        manager_grade: str,
    ) -> dict[str, Decimal]:
        """매니저 수익 계산."""
        # 등급별 수수료율
        fee_rates = {
            "new": Decimal("0.25"),  # 25%
            "regular": Decimal("0.20"),  # 20%
            "premium": Decimal("0.15"),  # 15%
        }

        fee_rate = fee_rates.get(manager_grade, Decimal("0.20"))
        platform_fee = total_price * fee_rate
        manager_revenue = total_price - platform_fee

        return {
            "total_price": total_price,
            "platform_fee": platform_fee,
            "fee_rate": fee_rate,
            "manager_revenue": manager_revenue,
        }
