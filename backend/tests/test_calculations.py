from datetime import date
from decimal import Decimal

from app.calculations import calculate_overtime, calculate_vacation, completed_months
from app.schemas import OvertimeRequest, VacationRequest


def test_overtime_uses_weekly_hours_and_multiplier():
    result = calculate_overtime(
        OvertimeRequest(
            monthly_salary=Decimal("900000"),
            weekly_hours=Decimal("44"),
            overtime_hours=Decimal("2"),
        )
    )

    assert result.estimated_hourly_rate == Decimal("4772.73")
    assert result.estimated_overtime_pay == Decimal("14318.19")


def test_completed_months_only_counts_full_months():
    assert completed_months(date(2025, 1, 15), date(2025, 3, 14)) == 1
    assert completed_months(date(2025, 1, 15), date(2025, 3, 15)) == 2
    assert completed_months(date(2025, 1, 15), date(2024, 12, 15)) == 0
    assert completed_months(date(2025, 1, 31), date(2025, 2, 28)) == 1


def test_vacation_subtracts_used_days_from_proportional_entitlement():
    result = calculate_vacation(
        VacationRequest(
            hire_date=date(2025, 1, 1),
            as_of=date(2025, 7, 1),
            days_used=Decimal("2"),
            annual_entitlement=Decimal("15"),
        )
    )

    assert result.completed_months == 6
    assert result.days_earned == Decimal("7.50")
    assert result.estimated_balance == Decimal("5.50")
