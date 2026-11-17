from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    monthly_salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    weekly_hours: Mapped[Decimal] = mapped_column(Numeric(4, 1), nullable=False)
    hire_date: Mapped[date] = mapped_column(Date, nullable=False)
    vacation_days_used: Mapped[Decimal] = mapped_column(
        Numeric(6, 2), nullable=False, default=Decimal("0")
    )
    special_vacation_zone: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
