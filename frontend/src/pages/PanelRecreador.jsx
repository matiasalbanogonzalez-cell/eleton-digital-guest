import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BarraSuperior from "../components/BarraSuperior";
import { CATS } from "../constants/categorias";

const CATEGORIAS = ["KIDS", "ADOLESCENTES", "ADULTOS"];

export default function PanelRecreador() {
  const { token } = useAuth();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [participantesDe, setParticipantesDe] = useState(null); // actividad seleccionada
  const [participantes, setParticipantes] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "", categoria: "KIDS", descripcion: "", lugar: "",
    fecha: new Date().toISOString().slice(0, 10), horaInicio: "10:00", horaFin: "11:00",
    edadMinima: 0, edadMaxima: 99, cupoMaximo: 20,
  });

  function cargar() {
    setCargando(true);
    api.listarActividades(token, "TODAS").then(setActividades).finally(() => setCargando(false));
  }

  useEffect(cargar, [token]);

  function set(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  async function crear(e) {
    e.preventDefault();
    setError("");
    try {
      await api.crearActividad(token, form);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function verParticipantes(actividad) {
    setParticipantesDe(actividad);
    const data = await api.listarParticipantes(token, actividad.id);
    setParticipantes(data);
  }

  async function toggleAsistencia(inscripcionId, actual) {
    await api.marcarAsistencia(token, inscripcionId, !actual);
    const data = await api.listarParticipantes(token, participantesDe.id);
    setParticipantes(data);
  }

  async function cancelarActividad(id) {
    await api.cancelarActividad(token, id);
    cargar();
  }

  return (
    <div className="app-frame">
      <BarraSuperior />
      <div style={{ padding: "6px 18px 32px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="font-display" style={{ color: "var(--paper)", fontSize: 26 }}>Panel recreador</div>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: 11 }} onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? "Cerrar" : "+ Nueva"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={crear} style={{ background: "var(--paper)", borderRadius: 14, padding: 16, marginBottom: 18 }}>
            <div className="form-field">
              <label className="form-label">Nombre</label>
              <input className="form-input" required value={form.nombre} onChange={set("nombre")} placeholder="Ej: Clase de tenis" />
            </div>
            <div className="form-field">
              <label className="form-label">Descripción</label>
              <input className="form-input" value={form.descripcion} onChange={set("descripcion")} />
            </div>
            <div className="form-field">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={form.categoria} onChange={set("categoria")}>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{CATS[c].label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-field">
                <label className="form-label">Lugar</label>
                <input className="form-input" required value={form.lugar} onChange={set("lugar")} />
              </div>
              <div className="form-field">
                <label className="form-label">Fecha</label>
                <input className="form-input" type="date" value={form.fecha} onChange={set("fecha")} />
              </div>
              <div className="form-field">
                <label className="form-label">Hora inicio</label>
                <input className="form-input" value={form.horaInicio} onChange={set("horaInicio")} />
              </div>
              <div className="form-field">
                <label className="form-label">Hora fin</label>
                <input className="form-input" value={form.horaFin} onChange={set("horaFin")} />
              </div>
              <div className="form-field">
                <label className="form-label">Edad mínima</label>
                <input className="form-input" type="number" value={form.edadMinima} onChange={set("edadMinima")} />
              </div>
              <div className="form-field">
                <label className="form-label">Edad máxima</label>
                <input className="form-input" type="number" value={form.edadMaxima} onChange={set("edadMaxima")} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Cupo máximo</label>
              <input className="form-input" type="number" value={form.cupoMaximo} onChange={set("cupoMaximo")} />
            </div>
            {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
            <button className="btn-primary" style={{ width: "100%" }} type="submit">Guardar actividad</button>
          </form>
        )}

        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && actividades.map((a) => {
          const inscriptos = a.cupoMaximo - a.cuposDisponibles;
          return (
            <div key={a.id} style={{ background: "var(--paper)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.nombre}</div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{a.horaInicio} · {a.lugar} · {a.estado}</div>
                </div>
                <div className="font-mono" style={{ fontSize: 11, background: "var(--paper-2)", padding: "4px 9px", borderRadius: 20, fontWeight: 600 }}>
                  {inscriptos}/{a.cupoMaximo} 👥
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5, color: "var(--text-soft)", borderColor: "rgba(27,43,39,0.2)" }} onClick={() => verParticipantes(a)}>
                  Ver participantes
                </button>
                {a.estado !== "CANCELADA" && (
                  <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5, color: "#B23A2E", borderColor: "rgba(178,58,46,0.3)" }} onClick={() => cancelarActividad(a.id)}>
                    Cancelar actividad
                  </button>
                )}
              </div>

              {participantesDe?.id === a.id && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--paper-2)", paddingTop: 10 }}>
                  {participantes.length === 0 && <div style={{ fontSize: 12, color: "var(--text-soft)" }}>Sin inscriptos todavía.</div>}
                  {participantes.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                      <div style={{ fontSize: 12.5 }}>
                        {p.usuario.nombre} {p.usuario.apellido}
                        {p.usuario.habitacion ? ` · Hab. ${p.usuario.habitacion}` : ""}
                        {p.estado === "LISTA_ESPERA" ? " (lista de espera)" : ""}
                      </div>
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 10px", fontSize: 10, borderColor: p.asistio ? "#1F7A4D" : "rgba(27,43,39,0.2)", color: p.asistio ? "#1F7A4D" : "var(--text-soft)" }}
                        onClick={() => toggleAsistencia(p.id, p.asistio)}
                      >
                        {p.asistio ? "✓ Asistió" : "Marcar asistencia"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
