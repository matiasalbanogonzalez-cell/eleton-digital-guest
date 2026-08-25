import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PRIORIDAD_COLOR = { ALTA: "#B23A2E", MEDIA: "var(--gold)", BAJA: "var(--text-soft)" };

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PanelAvisos() {
  const { token } = useAuth();
  const [avisos, setAvisos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    titulo: "", mensaje: "", fechaInicio: hoyISO(), fechaFin: hoyISO(),
    prioridad: "MEDIA", seccionAfectada: "", zonaIds: [],
  });

  const cargar = useCallback(() => {
    setCargando(true);
    Promise.all([api.listarAvisosAdmin(token), api.listarZonasHotel()])
      .then(([a, z]) => { setAvisos(a); setZonas(z); })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token]);

  useEffect(cargar, [cargar]);

  function toggleZona(id) {
    setForm((f) => ({
      ...f,
      zonaIds: f.zonaIds.includes(id) ? f.zonaIds.filter((z) => z !== id) : [...f.zonaIds, id],
    }));
  }

  async function crear(e) {
    e.preventDefault();
    setError("");
    try {
      await api.crearAviso(token, form);
      setForm({ titulo: "", mensaje: "", fechaInicio: hoyISO(), fechaFin: hoyISO(), prioridad: "MEDIA", seccionAfectada: "", zonaIds: [] });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActivo(id) {
    await api.toggleActivoAviso(token, id);
    cargar();
  }

  async function eliminar(id) {
    await api.eliminarAviso(token, id);
    cargar();
  }

  const cardStyle = { background: "var(--paper)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 };

  return (
    <div className="app-frame">
      <div style={{ padding: "16px 18px 10px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>Avisos</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              ADMINISTRACIÓN
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/admin/dashboard" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>← Dashboard</Link>
          </div>
        </div>

        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && (
          <>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 14 }} onClick={() => setMostrarForm(!mostrarForm)}>
              {mostrarForm ? "Cerrar" : "+ Nuevo aviso"}
            </button>

            {mostrarForm && (
              <form onSubmit={crear} style={{ background: "var(--paper)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <div className="form-field">
                  <label className="form-label">Título</label>
                  <input className="form-input" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Mensaje</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    required
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-field">
                    <label className="form-label">Desde</label>
                    <input className="form-input" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Hasta</label>
                    <input className="form-input" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Prioridad</label>
                  <select className="form-select" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Sección afectada (opcional)</label>
                  <select className="form-select" value={form.seccionAfectada} onChange={(e) => setForm({ ...form, seccionAfectada: e.target.value })}>
                    <option value="">General</option>
                    <option value="resto">Restó</option>
                    <option value="spa">Spa</option>
                    <option value="teatro">Teatro</option>
                    <option value="recreacion">Recreación</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Zonas (vacío = todos los huéspedes)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {zonas.map((z) => (
                      <button
                        type="button"
                        key={z.id}
                        onClick={() => toggleZona(z.id)}
                        className="btn-ghost"
                        style={{
                          padding: "6px 10px", fontSize: 10.5,
                          borderColor: form.zonaIds.includes(z.id) ? "var(--gold)" : "rgba(255,255,255,0.15)",
                          color: form.zonaIds.includes(z.id) ? "var(--gold)" : "var(--paper-2)",
                        }}
                      >
                        {z.nombre}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%" }} type="submit">Publicar aviso</button>
              </form>
            )}

            {avisos.length === 0 && <p style={{ color: "var(--paper-2)", opacity: 0.6, fontSize: 12.5 }}>No hay avisos creados.</p>}

            {avisos.map((a) => (
              <div key={a.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.titulo}</div>
                    <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{a.mensaje}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-soft)", marginTop: 4 }}>
                      {new Date(a.fechaInicio).toLocaleDateString("es-AR")} – {new Date(a.fechaFin).toLocaleDateString("es-AR")}
                      {" · "}
                      {a.zonas.length === 0 ? "Todos" : a.zonas.map((z) => z.nombre).join(", ")}
                    </div>
                  </div>
                  <span className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: PRIORIDAD_COLOR[a.prioridad] }}>
                    {a.prioridad}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }} onClick={() => toggleActivo(a.id)}>
                    {a.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 10.5, color: "#B23A2E", borderColor: "rgba(178,58,46,0.3)" }}
                    onClick={() => eliminar(a.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
