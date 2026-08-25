import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Baby, CheckCircle2, Home, Clock } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { api } from "../api/client";
import { setGuestIdentity } from "../utils/guestIdentity";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReservaSpa() {
  const [paso, setPaso] = useState(1);

  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [fecha, setFecha] = useState(hoyISO());

  const [bloques, setBloques] = useState([]);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [horaElegida, setHoraElegida] = useState("");

  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [reserva, setReserva] = useState(null);

  async function buscarHorarios() {
    setError("");
    setCargandoBloques(true);
    try {
      const data = await api.listarHorariosSpa(fecha, adultos, ninos);
      setBloques(data.bloques);
      setPaso(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoBloques(false);
    }
  }

  async function confirmarReserva(e) {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !habitacion.trim()) {
      setError("Nombre y habitación son obligatorios.");
      return;
    }
    setConfirmando(true);
    try {
      const data = await api.crearReservaSpa({
        fecha,
        horaInicio: horaElegida,
        personasAdultos: Number(adultos),
        personasNinos: Number(ninos),
        nombre: nombre.trim(),
        habitacion: habitacion.trim(),
      });
      setGuestIdentity({ nombre: nombre.trim(), habitacion: habitacion.trim() });
      setReserva(data);
      setPaso(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <PublicLayout>
      <section className="placeholder-hero resto-reserva-hero">
        <Link to="/spa" className="btn-ghost placeholder-back">
          ← Spa
        </Link>

        <div className="section-title-eyebrow font-mono">Circuito Hídrico</div>
        <h1 className="hero-title font-display spa-hero-title">Reservar turno</h1>

        {paso < 5 && (
          <div className="resto-progress">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`resto-progress-dot ${paso >= n ? "is-active" : ""}`} />
            ))}
          </div>
        )}
      </section>

      <section className="resto-reserva-section">
        {/* PASO 1: personas */}
        {paso === 1 && (
          <div className="resto-step-card">
            <h2 className="section-title font-display">¿Cuántos van?</h2>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label className="form-label">
                <Users size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Adultos
              </label>
              <div className="resto-stepper" style={{ margin: "8px 0" }}>
                <button type="button" className="resto-stepper-btn" onClick={() => setAdultos((p) => Math.max(1, p - 1))}>−</button>
                <span className="resto-stepper-value">{adultos}</span>
                <button type="button" className="resto-stepper-btn" onClick={() => setAdultos((p) => Math.min(25, p + 1))}>+</button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">
                <Baby size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Niños
              </label>
              <div className="resto-stepper" style={{ margin: "8px 0" }}>
                <button type="button" className="resto-stepper-btn" onClick={() => setNinos((p) => Math.max(0, p - 1))}>−</button>
                <span className="resto-stepper-value">{ninos}</span>
                <button type="button" className="resto-stepper-btn" onClick={() => setNinos((p) => Math.min(25, p + 1))}>+</button>
              </div>
              {ninos > 0 && (
                <p className="section-title-sub" style={{ marginTop: 6 }}>
                  Con niños, el circuito solo se muestra disponible de 10 a 14hs y desde las 19hs.
                </p>
              )}
            </div>

            <div className="resto-step-actions" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn-primary" onClick={() => setPaso(2)}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: fecha */}
        {paso === 2 && (
          <div className="resto-step-card">
            <h2 className="section-title font-display">¿Para qué fecha?</h2>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label className="form-label">Fecha</label>
              <input className="form-input" type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>

            {error && <div className="resto-error">{error}</div>}

            <div className="resto-step-actions">
              <button type="button" className="btn-ghost" onClick={() => setPaso(1)}>← Volver</button>
              <button type="button" className="btn-primary" onClick={buscarHorarios} disabled={cargandoBloques}>
                {cargandoBloques ? "Buscando…" : "Ver horarios"}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: elegir horario */}
        {paso === 3 && (
          <div className="resto-step-card">
            <h2 className="section-title font-display">Elegí un horario</h2>

            {bloques.length === 0 && (
              <p className="section-title-sub" style={{ marginTop: 12 }}>
                No hay horarios disponibles para esa combinación de fecha y personas.
              </p>
            )}

            <div className="resto-horario-grid" style={{ marginTop: 14, flexDirection: "column" }}>
              {bloques.map((b) => (
                <button
                  key={b.horaInicio}
                  type="button"
                  disabled={!b.disponible}
                  className={`resto-horario-btn ${horaElegida === b.horaInicio ? "is-selected" : ""}`}
                  style={{ justifyContent: "space-between", opacity: b.disponible ? 1 : 0.4, width: "100%" }}
                  onClick={() => setHoraElegida(b.horaInicio)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} />
                    {b.horaInicio} – {b.horaFin}
                  </span>
                  <span className="font-mono" style={{ fontSize: 11 }}>
                    {b.disponible ? `${b.lugaresDisponibles} lugares` : "Sin lugar"}
                  </span>
                </button>
              ))}
            </div>

            <div className="resto-step-actions">
              <button type="button" className="btn-ghost" onClick={() => setPaso(2)}>← Volver</button>
              <button type="button" className="btn-primary" onClick={() => setPaso(4)} disabled={!horaElegida}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: confirmar */}
        {paso === 4 && (
          <div className="resto-step-card">
            <h2 className="section-title font-display">Tus datos</h2>
            <form onSubmit={confirmarReserva} className="resto-confirm-form">
              <div className="form-field">
                <label className="form-label">Nombre y apellido</label>
                <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" required />
              </div>
              <div className="form-field">
                <label className="form-label">Habitación</label>
                <input className="form-input" value={habitacion} onChange={(e) => setHabitacion(e.target.value)} placeholder="Ej: 204" required />
              </div>

              {error && <div className="resto-error">{error}</div>}

              <div className="resto-step-actions">
                <button type="button" className="btn-ghost" onClick={() => setPaso(3)}>← Volver</button>
                <button type="submit" className="btn-primary" disabled={confirmando}>
                  {confirmando ? "Confirmando…" : "Confirmar reserva"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 5: confirmada */}
        {paso === 5 && reserva && (
          <div className="resto-step-card resto-confirm-card">
            <div className="resto-confirm-check">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="section-title font-display">¡Turno confirmado!</h2>

            <div className="resto-confirm-summary">
              <div className="resto-confirm-row">
                <span className="info-label">Fecha</span>
                <p>{new Date(reserva.turno.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">Horario</span>
                <p>{reserva.turno.horaInicio} – {reserva.turno.horaFin}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">Personas</span>
                <p>{reserva.personasAdultos} adultos{reserva.personasNinos > 0 ? ` + ${reserva.personasNinos} niños` : ""}</p>
              </div>
              <div className="resto-confirm-row">
                <span className="info-label">N° de reserva</span>
                <p className="font-mono">{reserva.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <Link to="/spa" className="btn-primary resto-confirm-btn">
              <Home size={16} />
              Volver a Spa
            </Link>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
