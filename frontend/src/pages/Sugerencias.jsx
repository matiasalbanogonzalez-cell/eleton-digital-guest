
import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Smile, AlertTriangle, Wrench, HelpCircle, Star, Send, CheckCircle2, Home } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { api } from "../api/client";

const TIPOS = [
  { value: "SUGERENCIA", label: "Sugerencia", icon: MessageSquare },
  { value: "FELICITACION", label: "Felicitación", icon: Smile },
  { value: "RECLAMO", label: "Reclamo", icon: AlertTriangle },
  { value: "PROBLEMA_SERVICIO", label: "Problema con un servicio", icon: Wrench },
  { value: "OTRO", label: "Otro", icon: HelpCircle },
];

const CATEGORIAS = [
  { value: "RESTO", label: "Restó" },
  { value: "SPA", label: "Spa" },
  { value: "RECREACION", label: "Recreación" },
  { value: "TEATRO", label: "Teatro" },
  { value: "HABITACION", label: "Habitación" },
  { value: "ATENCION", label: "Atención" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "INSTALACIONES", label: "Instalaciones" },
  { value: "OTRO", label: "Otro" },
];

export default function Sugerencias() {
  const [tipo, setTipo] = useState("SUGERENCIA");
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [valoracion, setValoracion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!habitacion.trim() || !categoria || !mensaje.trim()) {
      setError("Completá habitación, categoría y mensaje antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      await api.crearSugerencia({
        tipo,
        nombre: nombre.trim() || undefined,
        habitacion: habitacion.trim(),
        categoria,
        mensaje: mensaje.trim(),
        valoracion: valoracion || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <PublicLayout>
        <section className="resto-reserva-section" style={{ paddingTop: 24 }}>
          <div className="resto-step-card resto-confirm-card">
            <div className="resto-confirm-check">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="section-title font-display">¡Gracias por tu mensaje!</h2>
            <p className="section-title-sub" style={{ margin: "8px auto 0" }}>
              Lo recibimos y lo va a revisar el equipo correspondiente de Eleton.
            </p>
            <Link to="/" className="btn-primary resto-confirm-btn" style={{ marginTop: 20 }}>
              <Home size={16} />
              Volver al inicio
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="placeholder-hero hotel-hero">
        <div className="section-title-eyebrow font-mono">Sugerencias y comentarios</div>
        <h1 className="hero-title font-display spa-hero-title">Tu opinión nos ayuda a mejorar</h1>
        <p className="hero-sub spa-hero-sub">
          Contanos cómo va tu estadía: sugerencias, felicitaciones o reclamos, todo suma.
        </p>
      </section>

      <section className="resto-reserva-section">
        <form onSubmit={handleSubmit} className="resto-step-card">
          <div className="form-field">
            <label className="form-label">Tipo de mensaje</label>
            <div className="resto-servicio-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {TIPOS.map((t) => {
                const Icon = t.icon;
                const activo = tipo === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    className={`resto-servicio-btn ${activo ? "is-selected" : ""}`}
                  >
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="detail-form-grid" style={{ marginTop: 18 }}>
            <div className="form-field">
              <label className="form-label">Nombre (opcional)</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="form-input"
                placeholder="Tu nombre"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Habitación *</label>
              <input
                type="text"
                value={habitacion}
                onChange={(e) => setHabitacion(e.target.value)}
                className="form-input"
                placeholder="Ej: 204"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Categoría *</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Seleccioná una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Mensaje *</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              className="form-input"
              style={{ resize: "vertical" }}
              placeholder="Contanos qué pasó o qué se te ocurre..."
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Valoración (opcional)</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setValoracion(valoracion === n ? 0 : n)}
                  aria-label={`${n} estrellas`}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                >
                  <Star
                    size={26}
                    color={n <= valoracion ? "var(--gold)" : "var(--paper-2)"}
                    fill={n <= valoracion ? "var(--gold)" : "none"}
                    style={{ opacity: n <= valoracion ? 1 : 0.35 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {error && <div className="field-error">{error}</div>}

          <button type="submit" disabled={enviando} className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%" }}>
              <Send size={16} />
              {enviando ? "Enviando..." : "Enviar"}
            </span>
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}
