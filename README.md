# TurnoClaro

MVP de portafolio para administrar datos básicos de colaboradores y explorar cálculos de horas extra y vacaciones en Chile.

## Tecnologías

- Backend: Python 3.11+, FastAPI, SQLAlchemy y MySQL.
- Frontend: React, TypeScript y Vite.
- Pruebas: pytest.

## Iniciar con Docker Compose

Requiere Docker Desktop y Node.js 20+.

1. Copia `backend/.env.example` a `backend/.env`.
2. Desde la raíz, inicia MySQL: `docker compose up -d db`.
3. En una terminal:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. En otra terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

La aplicación queda en `http://localhost:5173` y la documentación interactiva de la API en `http://localhost:8000/docs`. MySQL se publica en el puerto `3307` para evitar conflictos con instalaciones locales.

## Supuestos del MVP

- El cálculo de hora extra usa la remuneración mensual y la jornada semanal ingresadas: valor hora = sueldo mensual × 7 ÷ (30 × horas semanales); pago = valor hora × 1,5 × horas extra. Es una estimación visible y editable, no una liquidación de sueldo.
- El cálculo de vacaciones acumula días proporcionales por meses completos desde la fecha de contratación. Usa 15 días hábiles anuales como valor general y 20 para zonas especiales, menos los días usados que ingrese el usuario.
- No se implementan vacaciones progresivas, jornadas excepcionales, componentes variables de remuneración, feriados/calendarios ni reglas transitorias. Las reglas laborales deben ser revisadas por un especialista y configurarse para el caso concreto antes de usar este proyecto en producción.

## API principal

- `GET /api/health`: estado de la API y conexión a base de datos.
- `GET /api/employees`: lista colaboradores.
- `POST /api/employees`: crea un colaborador.
- `POST /api/calculations/overtime`: estima el pago de horas extra.
- `POST /api/calculations/vacation`: estima el saldo de vacaciones.

## Ideas para extenderlo en una entrevista

1. Agregar autenticación y roles.
2. Guardar períodos de asistencia y resultados auditables.
3. Incorporar reglas versionadas y pruebas para casos legales revisados.
4. Agregar migraciones con Alembic y pruebas de integración con MySQL.
