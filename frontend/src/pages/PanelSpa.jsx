import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PanelSpa() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [seccion, setSeccion] = useState("reservas");
  const [fecha, setFecha] = useState(hoyISO());

  const [resumen, setResumen] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [horarioBase, setHorarioBase] = useState([]);
  const [restricciones, setRestricciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarNuevaTemporada, setMostrarNuevaTemporada] = useState(false);
  const [nuevaTemporada, setNuevaTemporada] = useState({ nombre: "", fechaInicio: "", fechaFin: "", horaApertura: "09:00", horaCierre: "21:00" });
  const [nuevaRestriccion, setNuevaRestriccion] = useState({ horaInicio: "", horaFin: "" });

  const cargarTodo = useCallback(() => {
    setCargando(true);
    Promise.all([
      api.panelSpa(token, fecha),
      api.listarReservasSpa(token, { fecha }),
      api.listarTemporadasSpa(token),
      api.listarHorarioBaseSpa(token),
      api.listarRestriccionesNinosSpa(token),
    ])
      .then(([r, res, temp, hb, rn]) => {
        setResumen(r); setReservas(res); setTemporadas(temp); setHorarioBase(hb); setRestricciones(rn);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token, fecha]);

  useEffect(cargarTodo, [cargarTodo]);

  async function cancelar(id) {
    try {
      await api.cancelarReservaSpa(token, id);
      toast.success("El turno del Spa fue cancelado correctamente.", {
        title: "¡Reserva cancelada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al cancelar turno" });
    }
  }

  async function crearTemporada(e) {
    e.preventDefault();
    setError("");
    try {
      await api.crearTemporadaSpa(token, nuevaTemporada);
      toast.success("La temporada de Spa fue creada correctamente.", {
        title: "¡Temporada creada!",
      });
      setNuevaTemporada({ nombre: "", fechaInicio: "", fechaFin: "", horaApertura: "09:00", horaCierre: "21:00" });
      setMostrarNuevaTemporada(false);
      cargarTodo();
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "Error al crear temporada" });
    }
  }

  async function toggleTemporada(t) {
    try {
      await api.editarTemporadaSpa(token, t.id, { activo: !t.activo });
      toast.success("El estado de la temporada fue actualizado.", {
        title: "¡Temporada actualizada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al actualizar temporada" });
    }
  }

  async function eliminarTemporada(id) {
    try {
      await api.eliminarTemporadaSpa(token, id);
      toast.success("La temporada fue eliminada correctamente.", {
        title: "¡Temporada eliminada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al eliminar temporada" });
    }
  }

  async function guardarHorario(diaSemana, campo, valor) {
    try {
      const actual = horarioBase.find((h) => h.diaSemana === diaSemana) || { horaApertura: "09:00", horaCierre: "20:00" };
      await api.guardarHorarioBaseSpa(token, { diaSemana, ...actual, [campo]: valor });
      toast.success("El horario base del Spa fue guardado.", {
        title: "¡Horario guardado!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al guardar horario" });
    }
  }

  async function crearRestriccion(e) {
    e.preventDefault();
    if (!nuevaRestriccion.horaInicio || !nuevaRestriccion.horaFin) return;
    try {
      await api.crearRestriccionNinosSpa(token, nuevaRestriccion);
      toast.success("La restricción horaria fue creada correctamente.", {
        title: "¡Restricción creada!",
      });
      setNuevaRestriccion({ horaInicio: "", horaFin: "" });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al crear restricción" });
    }
  }

  async function eliminarRestriccion(id) {
    try {
      await api.eliminarRestriccionNinosSpa(token, id);
      toast.success("La restricción fue eliminada correctamente.", {
        title: "¡Restricción eliminada!",
      });
      cargarTodo();
    } catch (err) {
      toast.error(err.message, { title: "Error al eliminar restricción" });
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
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>Panel Spa</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              ADMINISTRACIÓN
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/spa" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>Ver como huésped</Link>
            <Link to="/" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>← Inicio</Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          <span style={tabStyle(seccion === "reservas")} onClick={() => setSeccion("reservas")}>Reservas</span>
          <span style={tabStyle(seccion === "temporadas")} onClick={() => setSeccion("temporadas")}>Temporadas</span>
          <span style={tabStyle(seccion === "horario")} onClick={() => setSeccion("horario")}>Horario base</span>
          <span style={tabStyle(seccion === "ninos")} onClick={() => setSeccion("ninos")}>Restricción niños</span>
        </div>

        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && resumen && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[["Reservas hoy", resumen.reservasHoy], ["Personas", resumen.personas], ["Turnos usados", resumen.turnosUsados]].map(([label, valor]) => (
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
                  Hab. {r.habitacion} · {r.turno.horaInicio}–{r.turno.horaFin} · {r.personasAdultos} adultos
                  {r.personasNinos > 0 ? ` + ${r.personasNinos} niños` : ""}
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

        {!cargando && seccion === "temporadas" && (
          <>
            <button className="btn-primary" style={{ width: "100%", marginBottom: 14 }} onClick={() => setMostrarNuevaTemporada(!mostrarNuevaTemporada)}>
              {mostrarNuevaTemporada ? "Cerrar" : "+ Nueva temporada"}
            </button>

            {mostrarNuevaTemporada && (
              <form onSubmit={crearTemporada} style={{ background: "var(--paper)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <div className="form-field">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" required value={nuevaTemporada.nombre} onChange={(e) => setNuevaTemporada({ ...nuevaTemporada, nombre: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="form-field">
                    <label className="form-label">Desde</label>
                    <input className="form-input" type="date" required value={nuevaTemporada.fechaInicio} onChange={(e) => setNuevaTemporada({ ...nuevaTemporada, fechaInicio: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Hasta</label>
                    <input className="form-input" type="date" required value={nuevaTemporada.fechaFin} onChange={(e) => setNuevaTemporada({ ...nuevaTemporada, fechaFin: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Apertura</label>
                    <input className="form-input" required value={nuevaTemporada.horaApertura} onChange={(e) => setNuevaTemporada({ ...nuevaTemporada, horaApertura: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Cierre</label>
                    <input className="form-input" required value={nuevaTemporada.horaCierre} onChange={(e) => setNuevaTemporada({ ...nuevaTemporada, horaCierre: e.target.value })} />
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%" }} type="submit">Guardar temporada</button>
              </form>
            )}

            {temporadas.map((t) => (
              <div key={t.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                      {new Date(t.fechaInicio).toLocaleDateString("es-AR")} – {new Date(t.fechaFin).toLocaleDateString("es-AR")} · {t.horaApertura}-{t.horaCierre} · {t.activo ? "Activa" : "Inactiva"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 10 }} onClick={() => toggleTemporada(t)}>
                      {t.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 10, color: "#B23A2E" }} onClick={() => eliminarTemporada(t.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!cargando && seccion === "horario" && (
          <>
            <p style={{ fontSize: 11.5, color: "var(--paper-2)", opacity: 0.65, marginBottom: 14 }}>
              Horario fuera de temporada alta. Se usa automáticamente cuando la fecha no cae en ninguna temporada activa.
            </p>
            {DIAS.map((dia, i) => {
              const h = horarioBase.find((x) => x.diaSemana === i) || { horaApertura: "09:00", horaCierre: "20:00" };
              return (
                <div key={i} style={cardStyle}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{dia}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="form-field" style={{ margin: 0 }}>
                      <label className="form-label">Apertura</label>
                      <input className="form-input" defaultValue={h.horaApertura} onBlur={(e) => guardarHorario(i, "horaApertura", e.target.value)} />
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                      <label className="form-label">Cierre</label>
                      <input className="form-input" defaultValue={h.horaCierre} onBlur={(e) => guardarHorario(i, "horaCierre", e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!cargando && seccion === "ninos" && (
          <>
            <p style={{ fontSize: 11.5, color: "var(--paper-2)", opacity: 0.65, marginBottom: 14 }}>
              Ventanas horarias en las que se permite ingresar con niños.
            </p>
            <form onSubmit={crearRestriccion} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 14, alignItems: "end" }}>
              <div className="form-field" style={{ margin: 0 }}>
                <label className="form-label">Desde</label>
                <input className="form-input" placeholder="10:00" value={nuevaRestriccion.horaInicio} onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, horaInicio: e.target.value })} />
              </div>
              <div className="form-field" style={{ margin: 0 }}>
                <label className="form-label">Hasta</label>
                <input className="form-input" placeholder="14:00" value={nuevaRestriccion.horaFin} onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, horaFin: e.target.value })} />
              </div>
              <button className="btn-primary" style={{ padding: "10px 14px", fontSize: 11 }} type="submit">+ Agregar</button>
            </form>

            {restricciones.map((r) => (
              <div key={r.id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13 }}>{r.horaInicio} – {r.horaFin}</span>
                <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 10, color: "#B23A2E" }} onClick={() => eliminarRestriccion(r.id)}>
                  Eliminar
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
