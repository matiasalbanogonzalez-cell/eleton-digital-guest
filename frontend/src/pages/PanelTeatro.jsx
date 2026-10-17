import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PanelTeatro() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [seccion, setSeccion] = useState("reservas");
  const [fecha, setFecha] = useState(hoyISO());

  const [resumen, setResumen] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [formatos, setFormatos] = useState([]);
  const [funciones, setFunciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [editandoFormatoId, setEditandoFormatoId] = useState(null);
  const [aforoEdit, setAforoEdit] = useState("");
  const [mostrarNuevaFuncion, setMostrarNuevaFuncion] = useState(false);
  const [nuevaFuncion, setNuevaFuncion] = useState({ espectaculo: "", fecha: "", hora: "", formatoSalaId: "" });

  const cargarTodo = useCallback(() => {
    setCargando(true);
    Promise.all([
      api.panelTeatro(token, fecha),
      api.listarReservasTeatro(token, { fecha }),
      api.listarFormatosTeatro(token),
      api.listarFuncionesAdminTeatro(token),
    ])
      .then(([r, res, f, fn]) => { setResumen(r); setReservas(res); setFormatos(f); setFunciones(fn); })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token, fecha]);

  useEffect(cargarTodo, [cargarTodo]);

  async function cancelar(id) {
    try {
      await api.cancelarReservaTeatro(token, id);
      toast.success("La reserva para la función fue cancelada correctamente.", {
        title: "¡Reserva cancelada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al cancelar reserva" });
    }
  }

  function iniciarEdicionAforo(f) {
    setEditandoFormatoId(f.id);
    setAforoEdit(f.aforo);
  }

  async function guardarAforo(id) {
    try {
      await api.editarFormatoTeatro(token, id, { aforo: Number(aforoEdit) });
      toast.success("El aforo de la sala fue actualizado correctamente.", {
        title: "¡Aforo actualizado!",
      });
      setEditandoFormatoId(null);
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al actualizar aforo" });
    }
  }

  async function crearFuncion(e) {
    e.preventDefault();
    setError("");
    try {
      await api.crearFuncionTeatro(token, nuevaFuncion);
      toast.success("La función teatral fue programada exitosamente.", {
        title: "¡Función creada!",
      });
      setNuevaFuncion({ espectaculo: "", fecha: "", hora: "", formatoSalaId: "" });
      setMostrarNuevaFuncion(false);
      cargarTodo();
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "Error al crear función" });
    }
  }

  async function cancelarFuncion(f) {
    try {
      await api.editarFuncionTeatro(token, f.id, { estado: "CANCELADA" });
      toast.success("La función fue cancelada correctamente.", {
        title: "¡Función cancelada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al cancelar función" });
    }
  }

  const cardStyle = { background: "var(--paper)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 };
  const tabStyle = (activa) => ({
    padding: "8px 14px", borderRadius: 20, fontSize: 11.5, fontFamily: "'IBM Plex Mono'", cursor: "pointer",
    border: activa ? "none" : "1px solid rgba(255,255,255,0.15)",
    background: activa ? "var(--gold)" : "transparent",
    color: activa ? "var(--ink)" : "var(--paper-2)", fontWeight: activa ? 700 : 400,
  });

  return (
    <div className="app-frame">
      <div style={{ padding: "16px 18px 10px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>Panel Teatro</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              ADMINISTRACIÓN
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/teatro" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>Ver como huésped</Link>
            <Link to="/" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>← Inicio</Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          <span style={tabStyle(seccion === "reservas")} onClick={() => setSeccion("reservas")}>Reservas</span>
          <span style={tabStyle(seccion === "funciones")} onClick={() => setSeccion("funciones")}>Funciones</span>
          <span style={tabStyle(seccion === "formatos")} onClick={() => setSeccion("formatos")}>Formatos de sala</span>
        </div>

        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && resumen && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[["Funciones hoy", resumen.funcionesHoy], ["Reservas", resumen.reservasHoy], ["Personas", resumen.personas]].map(([label, valor]) => (
              <div key={label} className="info-card">
                <div className="info-label">{label}</div>
                <div className="info-value">{valor}</div>
              </div>
            ))}
          </div>
        )}

        {!cargando && seccion === "reservas" && (
          <>
            <div className="form-field">
              <label className="form-label">Fecha</label>
              <input className="form-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>

            {reservas.length === 0 && <p style={{ color: "var(--paper-2)", opacity: 0.6, fontSize: 12.5 }}>No hay reservas para esta fecha.</p>}

            {reservas.map((r) => (
              <div key={r.id} style={cardStyle}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.nombre}</div>
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                  Hab. {r.habitacion} · {r.funcion.espectaculo} · {r.funcion.hora} · {r.personas} pers.
                </div>
                {r.estado === "CONFIRMADA" && (
                  <button
                    className="btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 10.5, marginTop: 8, color: "#B23A2E", borderColor: "rgba(178,58,46,0.3)" }}
                    onClick={() => cancelar(r.id)}
                  >
                    Cancelar reserva
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {!cargando && seccion === "funciones" && (
          <>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 14 }} onClick={() => setMostrarNuevaFuncion(!mostrarNuevaFuncion)}>
              {mostrarNuevaFuncion ? "Cerrar" : "+ Nueva función"}
            </button>

            {mostrarNuevaFuncion && (
              <form onSubmit={crearFuncion} style={{ background: "var(--paper)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <div className="form-field">
                  <label className="form-label">Espectáculo</label>
                  <input className="form-input" required value={nuevaFuncion.espectaculo} onChange={(e) => setNuevaFuncion({ ...nuevaFuncion, espectaculo: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-field">
                    <label className="form-label">Fecha</label>
                    <input className="form-input" type="date" required value={nuevaFuncion.fecha} onChange={(e) => setNuevaFuncion({ ...nuevaFuncion, fecha: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Hora</label>
                    <input className="form-input" placeholder="21:30" required value={nuevaFuncion.hora} onChange={(e) => setNuevaFuncion({ ...nuevaFuncion, hora: e.target.value })} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Formato de sala</label>
                  <select className="form-select" required value={nuevaFuncion.formatoSalaId} onChange={(e) => setNuevaFuncion({ ...nuevaFuncion, formatoSalaId: e.target.value })}>
                    <option value="">Elegir...</option>
                    {formatos.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre} ({f.aforo})</option>
                    ))}
                  </select>
                </div>
                <button className="btn-primary" style={{ width: "100%" }} type="submit">Crear función</button>
              </form>
            )}

            {funciones.map((f) => {
              const ocupados = f.reservas.reduce((a, r) => a + r.personas, 0);
              return (
                <div key={f.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.espectaculo}</div>
                      <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                        {new Date(f.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })} · {f.hora} · {f.formatoSala.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{ocupados} / {f.formatoSala.aforo} ocupados</div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono'", color: f.estado === "PROGRAMADA" ? "#1F7A4D" : "#B23A2E" }}>
                      {f.estado}
                    </span>
                  </div>
                  {f.estado === "PROGRAMADA" && (
                    <button
                      className="btn-ghost"
                      style={{ padding: "6px 12px", fontSize: 10.5, marginTop: 8, color: "#B23A2E", borderColor: "rgba(178,58,46,0.3)" }}
                      onClick={() => cancelarFuncion(f)}
                    >
                      Cancelar función
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {!cargando && seccion === "formatos" && (
          <>
            <p style={{ fontSize: 11.5, color: "var(--paper-2)", opacity: 0.65, marginBottom: 14 }}>
              El aforo se puede cambiar en cualquier momento — impacta enseguida en la disponibilidad de todas las funciones futuras con este formato.
            </p>
            {formatos.map((f) => (
              <div key={f.id} style={cardStyle}>
                {editandoFormatoId === f.id ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div className="form-field" style={{ margin: 0, flex: 1 }}>
                      <label className="form-label">Aforo — {f.nombre}</label>
                      <input className="form-input" type="number" value={aforoEdit} onChange={(e) => setAforoEdit(e.target.value)} />
                    </div>
                    <button className="btn-primary" style={{ padding: "9px 14px", fontSize: 11 }} onClick={() => guardarAforo(f.id)}>Guardar</button>
                    <button className="btn-ghost" style={{ padding: "9px 14px", fontSize: 11 }} onClick={() => setEditandoFormatoId(null)}>Cancelar</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Aforo: {f.aforo} personas</div>
                    </div>
                    <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }} onClick={() => iniciarEdicionAforo(f)}>Editar aforo</button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
