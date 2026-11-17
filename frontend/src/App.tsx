import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Clock3, Plus, Users } from "lucide-react";

const API = "/api";

type Employee = {
  id: number;
  name: string;
  monthly_salary: string;
  weekly_hours: string;
  hire_date: string;
  vacation_days_used: string;
  special_vacation_zone: boolean;
};

type Vacation = {
  completed_months: number;
  days_earned: string;
  days_used: string;
  estimated_balance: string;
};

type Overtime = {
  estimated_hourly_rate: string;
  estimated_overtime_pay: string;
  formula: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return "No se pudo conectar con la API. Inicia el backend en la carpeta backend con: uvicorn app.main:app --reload";
  }
  return error instanceof Error ? error.message : fallback;
}

function money(value: number | string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacationById, setVacationById] = useState<Record<number, Vacation>>({});
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("900000");
  const [hours, setHours] = useState("42");
  const [hireDate, setHireDate] = useState("");
  const [daysUsed, setDaysUsed] = useState("0");
  const [specialZone, setSpecialZone] = useState(false);
  const [overtimeSalary, setOvertimeSalary] = useState("900000");
  const [overtimeWeek, setOvertimeWeek] = useState("42");
  const [overtimeHours, setOvertimeHours] = useState("2");
  const [overtimeResult, setOvertimeResult] = useState<Overtime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEmployees() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/employees`);
      if (!response.ok) throw new Error("No se pudo cargar la lista de colaboradores.");
      const data: Employee[] = await response.json();
      setEmployees(data);
      setError("");
      const balances = await Promise.all(
        data.map(async (employee) => {
          const result = await fetch(`${API}/employees/${employee.id}/vacation`);
          if (!result.ok) throw new Error("No se pudo calcular el saldo de vacaciones.");
          return [employee.id, (await result.json()) as Vacation] as const;
        }),
      );
      setVacationById(Object.fromEntries(balances));
    } catch (err) {
      setError(getErrorMessage(err, "Error inesperado al conectar con la API."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, []);

  async function addEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          monthly_salary: salary,
          weekly_hours: hours,
          hire_date: hireDate,
          vacation_days_used: daysUsed,
          special_vacation_zone: specialZone,
        }),
      });
      if (!response.ok) {
        const detail = await response.json();
        throw new Error(typeof detail.detail === "string" ? detail.detail : "Revisa los datos ingresados.");
      }
      setName("");
      setHireDate("");
      setDaysUsed("0");
      setSpecialZone(false);
      setNotice("Colaborador agregado correctamente.");
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar el colaborador."));
    }
  }

  async function calculateOvertime(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOvertimeResult(null);
    try {
      const response = await fetch(`${API}/calculations/overtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_salary: overtimeSalary,
          weekly_hours: overtimeWeek,
          overtime_hours: overtimeHours,
          hourly_multiplier: "1.5",
        }),
      });
      if (!response.ok) {
        const detail = await response.json();
        throw new Error(typeof detail.detail === "string" ? detail.detail : "Revisa los valores ingresados.");
      }
      setOvertimeResult(await response.json());
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo calcular las horas extra."));
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TurnoClaro inicio">
          <span className="brand-mark">t.</span>
          <span>turnoclaro</span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> Panel de demostración</span>
      </header>

      <section className="intro">
        <div className="eyebrow">PERSONAS & OPERACIONES</div>
        <h1>Una jornada más <span>clara.</span></h1>
        <p>Un punto de partida para ordenar datos de equipo y explorar cálculos laborales.</p>
      </section>

      {error && <div className="message error" role="alert">{error}</div>}
      {notice && <div className="message success" role="status">{notice}</div>}

      <section className="summary-grid" aria-label="Resumen">
        <article className="summary-card">
          <div className="summary-heading"><span>COLABORADORES</span><Users size={17} /></div>
          <strong>{loading ? "—" : employees.length.toString().padStart(2, "0")}</strong>
          <small>En el registro</small>
        </article>
        <article className="summary-card">
          <div className="summary-heading"><span>ÁREA DE TRABAJO</span><Clock3 size={17} /></div>
          <strong>Horas extra</strong>
          <small>Estimación según parámetros ingresados</small>
        </article>
        <article className="summary-card accent-card">
          <div className="summary-heading"><span>ENFOQUE</span><ArrowUpRight size={17} /></div>
          <strong>Chile</strong>
          <small>Reglas de referencia configurables</small>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel roster-panel">
          <div className="panel-title">
            <div>
              <div className="eyebrow">TU EQUIPO</div>
              <h2>Colaboradores</h2>
            </div>
            <span className="count-pill">{employees.length} registrados</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>PERSONA</th><th>SUELDO MENSUAL</th><th>JORNADA</th><th>SALDO VACACIONES*</th></tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td><span className="avatar">{employee.name.trim().charAt(0).toUpperCase()}</span><strong>{employee.name}</strong></td>
                    <td>{money(employee.monthly_salary)}</td>
                    <td>{employee.weekly_hours} h/sem</td>
                    <td><span className="balance">{vacationById[employee.id]?.estimated_balance ?? "—"} días</span></td>
                  </tr>
                ))}
                {!loading && employees.length === 0 && (
                  <tr><td className="empty-row" colSpan={4}>Todavía no hay colaboradores. Agrega el primero desde el formulario.</td></tr>
                )}
                {loading && <tr><td className="empty-row" colSpan={4}>Conectando con la API…</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="footnote">* Estimación proporcional; no contempla vacaciones progresivas ni otras reglas especiales.</p>
        </article>

        <aside className="panel form-panel">
          <div className="panel-title">
            <div>
              <div className="eyebrow">NUEVO REGISTRO</div>
              <h2>Agregar persona</h2>
            </div>
            <span className="icon-tile"><Plus size={19} /></span>
          </div>
          <form onSubmit={addEmployee}>
            <label htmlFor="name">Nombre</label>
            <input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Camila Rojas" required maxLength={120} />
            <div className="form-row">
              <div>
                <label htmlFor="salary">Sueldo mensual (CLP)</label>
                <input id="salary" type="number" min="1" step="1" value={salary} onChange={(event) => setSalary(event.target.value)} required />
              </div>
              <div>
                <label htmlFor="hours">Jornada semanal</label>
                <input id="hours" type="number" min="1" max="60" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} required />
              </div>
            </div>
            <label htmlFor="hire-date">Fecha de contratación</label>
            <div className="date-input">
              <CalendarDays size={16} aria-hidden="true" />
              <input id="hire-date" type="date" max={new Date().toISOString().slice(0, 10)} value={hireDate} onChange={(event) => setHireDate(event.target.value)} required />
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="days-used">Vacaciones usadas</label>
                <input id="days-used" type="number" min="0" step="0.5" value={daysUsed} onChange={(event) => setDaysUsed(event.target.value)} required />
              </div>
              <label className="check-option">
                <input type="checkbox" checked={specialZone} onChange={(event) => setSpecialZone(event.target.checked)} />
                Zona especial (20 días/año)
              </label>
            </div>
            <button type="submit" className="primary-button">Guardar colaborador <ArrowUpRight size={16} /></button>
          </form>
          <div className="form-tip"><span>i</span><p>Los datos se guardan en MySQL a través de la API Python. La zona especial se toma como parámetro del prototipo.</p></div>
        </aside>
      </section>

      <section className="calculator panel">
        <div className="calculator-heading">
          <div>
            <div className="eyebrow">CÁLCULO DEMOSTRATIVO</div>
            <h2>Calculadora de horas extra</h2>
            <p>La API calcula la estimación usando el sueldo, jornada y cantidad de horas indicados.</p>
          </div>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">Explorar API <ArrowUpRight size={16} /></a>
        </div>
        <form className="overtime-form" onSubmit={calculateOvertime}>
          <div>
            <label htmlFor="calc-salary">Sueldo mensual (CLP)</label>
            <input id="calc-salary" type="number" min="1" step="1" value={overtimeSalary} onChange={(event) => setOvertimeSalary(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="calc-week">Jornada semanal</label>
            <input id="calc-week" type="number" min="1" max="60" step="0.5" value={overtimeWeek} onChange={(event) => setOvertimeWeek(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="calc-hours">Horas extra</label>
            <input id="calc-hours" type="number" min="0.01" max="100" step="0.25" value={overtimeHours} onChange={(event) => setOvertimeHours(event.target.value)} required />
          </div>
          <button type="submit" className="primary-button">Calcular estimación <ArrowUpRight size={16} /></button>
        </form>
        {overtimeResult && (
          <div className="result-row" role="status">
            <span>Valor hora estimado <strong>{money(overtimeResult.estimated_hourly_rate)}</strong></span>
            <span>Pago estimado <strong>{money(overtimeResult.estimated_overtime_pay)}</strong></span>
          </div>
        )}
        <p className="calc-note">Estimación educativa con multiplicador 1,5. Revisa los supuestos descritos en el README antes de interpretar el resultado.</p>
      </section>

      <footer>
        <span>TurnoClaro <span className="footer-separator">/</span> Proyecto de portafolio</span>
        <span>Prototipo educativo · Verifica las reglas aplicables antes de usar resultados.</span>
      </footer>
    </main>
  );
}
