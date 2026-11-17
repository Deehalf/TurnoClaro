from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    monthly_salary: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    weekly_hours: Decimal = Field(gt=0, le=60, max_digits=4, decimal_places=1)
    hire_date: date
    vacation_days_used: Decimal = Field(
        default=Decimal("0"), ge=0, max_digits=6, decimal_places=2
    )
    special_vacation_zone: bool = False


class EmployeeRead(EmployeeCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class OvertimeRequest(BaseModel):
    monthly_salary: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    weekly_hours: Decimal = Field(gt=0, le=60, max_digits=4, decimal_places=1)
    overtime_hours: Decimal = Field(gt=0, le=100, max_digits=5, decimal_places=2)
    hourly_multiplier: Decimal = Field(
        default=Decimal("1.5"), gt=0, le=3, max_digits=3, decimal_places=2
    )


class OvertimeResult(BaseModel):
    estimated_hourly_rate: Decimal
    estimated_overtime_pay: Decimal
    currency: str = "CLP"
    formula: str


class VacationRequest(BaseModel):
    hire_date: date
    as_of: date
    days_used: Decimal = Field(default=Decimal("0"), ge=0, max_digits=6, decimal_places=2)
    annual_entitlement: Decimal = Field(
        default=Decimal("15"), gt=0, le=30, max_digits=4, decimal_places=2
    )


class VacationResult(BaseModel):
    completed_months: int
    days_earned: Decimal
    days_used: Decimal
    estimated_balance: Decimal
    formula: str
