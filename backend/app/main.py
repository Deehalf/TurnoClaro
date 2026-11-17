from datetime import date
from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .calculations import calculate_overtime, calculate_vacation
from .database import Base, engine, get_db
from .models import Employee
from .schemas import (
    EmployeeCreate,
    EmployeeRead,
    OvertimeRequest,
    OvertimeResult,
    VacationRequest,
    VacationResult,
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="TurnoClaro API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No fue posible conectar con MySQL.",
        ) from exc
    return {"status": "ok", "database": "connected"}


@app.get("/api/employees", response_model=list[EmployeeRead])
def list_employees(db: Session = Depends(get_db)):
    return db.scalars(select(Employee).order_by(Employee.name)).all()


@app.post(
    "/api/employees",
    response_model=EmployeeRead,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    employee = Employee(**payload.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.post("/api/calculations/overtime", response_model=OvertimeResult)
def overtime(payload: OvertimeRequest):
    return calculate_overtime(payload)


@app.post("/api/calculations/vacation", response_model=VacationResult)
def vacation(payload: VacationRequest):
    if payload.as_of < payload.hire_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha de cálculo no puede ser anterior a la contratación.",
        )
    return calculate_vacation(payload)


@app.get("/api/employees/{employee_id}/vacation", response_model=VacationResult)
def employee_vacation(
    employee_id: int,
    as_of: date | None = None,
    db: Session = Depends(get_db),
):
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Colaborador no encontrado.")
    effective_date = as_of or date.today()
    if effective_date < employee.hire_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha de cálculo no puede ser anterior a la contratación.",
        )
    return calculate_vacation(
        VacationRequest(
            hire_date=employee.hire_date,
            as_of=effective_date,
            days_used=employee.vacation_days_used,
            annual_entitlement=Decimal("20")
            if employee.special_vacation_zone
            else Decimal("15"),
        )
    )
