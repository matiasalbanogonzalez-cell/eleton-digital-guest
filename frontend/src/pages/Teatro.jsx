import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Theater, CalendarDays, Users, CheckCircle2, Home } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { api } from "../api/client";
import { setGuestIdentity } from "../utils/guestIdentity";

export default function Teatro() {
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [funcionElegida, setFuncionElegida] = useState(null);
  const [personas, setPersonas] = useState(2);
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    api
      .listarFuncionesTeatro()
      .then(setFunciones)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  function elegirFuncion(f) {
    setFuncionElegida(f);
    setReserva(null);
    setErrorReserva("");
  }

  async function confirmarReserva(e) {
    e.preventDefault();
    setErrorReserva("");
    if (!nombre.trim() || !habitacion.trim()) {
      setErrorReserva("Nombre y habitación son obligatorios.");
      return;
    }
    setConfirmando(true);
    try {
      const data = await api.crearReservaTeatro({
        funcionId: funcionElegida.id,
        personas: Number(personas),
        nombre: nombre.trim(),
        habitacion: habitacion.trim(),
      });
      setGuestIdentity({ nombre: nombre.trim(), habitacion: habitacion.trim() });
      setReserva(data);
    } catch (err) {
      setErrorReserva(err.message);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <PublicLayout>
      <section className="placeholder-hero hotel-hero">
        <Link to="/" className="btn-ghost placeholder-back">
          ← Inicio
        </Link>
        <div className="section-title-eyebrow font-mono">Teatro</div>
        <h1 className="hero-title font-display spa-hero-title">Shows y entretenimiento</h1>
        <p className="hero-sub spa-hero-sub">Elegí una función y reservá tu lugar.</p>
      </section>

      <section className="resto-reserva-section">
        {cargando && <p className="resto-step-loading">Cargando funciones…</p>}
        {!cargando && error && <div className="resto-error">{error}</div>}
        {!cargando && !error && funciones.length === 0 && (
          <p className="section-title-sub">No hay funciones programadas por el momento.</p>
        )}

        {!cargando && !funcionElegida && funciones.length > 0 && (
          <div className="spa-services-grid" style={{ gridTemplateColumns: "1fr" }}>
            {funciones.map((f) => (
              <button key={f.id} type="button" className="spa-contact-card" style={{ textAlign: "left" }} onClick={() => elegirFuncion(f)}>
                <span className="spa-contact-icon">
                  <Theater size={18} />
                </span>
                <span style={{ flex: 1 }}>
                  <span className="info-label">{f.formatoSala}</span>
                  <p style={{ margin: "4px 0 2px" }}>{f.espectaculo}</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--paper-2)", opacity: 0.75 }}>
                    <CalendarDays size={13} />
                    {new Date(f.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })} · {f.hora} ·{" "}
                    {f.lugaresDisponibles > 0 ? `${f.lugaresDisponibles} lugares` : "Sin lugares"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {funcionElegida && !reserva && (
          <div className="resto-step-card">
            <h2 className="section-title font-display">{funcionElegida.espectaculo}</h2>
            <p className="section-title-sub">
              {new Date(funcionElegida.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })} · {funcionElegida.hora} · {funcionElegida.formatoSala}
            </p>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label className="form-label">
                <Users size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Personas
              </label>
              <div className="resto-stepper" style={{ margin: "8px 0" }}>
                <button type="button" className="resto-stepper-btn" onClick={() => setPersonas((p) => Math.max(1, p - 1))}>−</button>
                <span className="resto-stepper-value">{personas}</span>
                <button type="button" className="resto-stepper-btn" onClick={() => setPersonas((p) => Math.min(10, p + 1))}>+</button>
              </div>
            </div>

            <form onSubmit={confirmarReserva} className="resto-confirm-form">
              <div className="form-field">
                <label className="form-label">Nombre y apellido</label>
                <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" required />
              </div>
              <div className="form-field">
                <label className="form-label">Habitación</label>
                <input className="form-input" value={habitacion} onChange={(e) => setHabitacion(e.target.value)} placeholder="Ej: 204" required />
              </div>

              {errorReserva && <div className="resto-error">{errorReserva}</div>}

              <div className="resto-step-actions">
                <button type="button" className="btn-ghost" onClick={() => setFuncionElegida(null)}>← Elegir otra función</button>
                <button type="submit" className="btn-primary" disabled={confirmando}>
                  {confirmando ? "Confirmando…" : "Confirmar reserva"}
                </button>
              </div>
            </form>
          </div>
        )}

        {reserva && (
          <div className="resto-step-card resto-confirm-card">
            <div className="resto-confirm-check">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="section-title font-display">¡Reserva confirmada!</h2>

            <div className="resto-confirm-summary">
              <div className="resto-confirm-row">
                <span className="info-label">Función</span>
                <p>{reserva.funcion.espectaculo}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">Fecha</span>
                <p>{new Date(reserva.funcion.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })} · {reserva.funcion.hora}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">Personas</span>
                <p>{reserva.personas}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">N° de reserva</span>
                <p className="font-mono">{reserva.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <Link to="/" className="btn-primary resto-confirm-btn">
              <Home size={16} />
              Volver al inicio
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
