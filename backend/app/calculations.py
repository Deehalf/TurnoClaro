import calendar
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from .schemas import OvertimeRequest, OvertimeResult, VacationRequest, VacationResult


CENT = Decimal("0.01")


def calculate_overtime(request: OvertimeRequest) -> OvertimeResult:
    hourly_rate = (
        request.monthly_salary * Decimal("7") / (Decimal("30") * request.weekly_hours)
    ).quantize(CENT, rounding=ROUND_HALF_UP)
    pay = (
        hourly_rate * request.hourly_multiplier * request.overtime_hours
    ).quantize(CENT, rounding=ROUND_HALF_UP)
    return OvertimeResult(
        estimated_hourly_rate=hourly_rate,
        estimated_overtime_pay=pay,
        formula="sueldo mensual × 7 ÷ (30 × horas semanales); valor hora × multiplicador × horas extra",
    )


def completed_months(hire_date: date, as_of: date) -> int:
    months = (as_of.year - hire_date.year) * 12 + as_of.month - hire_date.month
    anniversary_day = min(
        hire_date.day, calendar.monthrange(as_of.year, as_of.month)[1]
    )
    if as_of.day < anniversary_day:
        months -= 1
    return max(0, months)


def calculate_vacation(request: VacationRequest) -> VacationResult:
    months = completed_months(request.hire_date, request.as_of)
    earned = (request.annual_entitlement * Decimal(months) / Decimal("12")).quantize(
        CENT, rounding=ROUND_HALF_UP
    )
    balance = (earned - request.days_used).quantize(CENT, rounding=ROUND_HALF_UP)
    return VacationResult(
        completed_months=months,
        days_earned=earned,
        days_used=request.days_used,
        estimated_balance=balance,
        formula="días anuales configurados × meses completos ÷ 12 − días usados",
    )
