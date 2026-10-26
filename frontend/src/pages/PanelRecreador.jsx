import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BarraSuperior from "../components/BarraSuperior";
import { CATS } from "../constants/categorias";
import { useToast } from "../context/ToastContext";

const CATEGORIAS = ["KIDS", "ADOLESCENTES", "ADULTOS"];

export default function PanelRecreador() {
  const { token, usuario } = useAuth();
  const { toast } = useToast();

  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [participantesDe, setParticipantesDe] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    categoria: "KIDS",
    descripcion: "",
    lugar: "",
    fecha: new Date().toISOString().slice(0, 10),
    horaInicio: "10:00",
    horaFin: "11:00",
    edadMinima: 0,
    edadMaxima: 99,
    cupoMaximo: 20,
  });

  function limpiarFormulario() {
    setForm({
      nombre: "",
      categoria: "KIDS",
      descripcion: "",
      lugar: "",
      fecha: new Date().toISOString().slice(0, 10),
      horaInicio: "10:00",
      horaFin: "11:00",
      edadMinima: 0,
      edadMaxima: 99,
      cupoMaximo: 20,
    });
  }

  function abrirNuevaActividad() {
    setActividadEditando(null);
    limpiarFormulario();
    setError("");
    setMostrarForm(true);
  }

  function editarActividad(actividad) {
    setActividadEditando(actividad);
    setForm({
      nombre: actividad.nombre || "",
      categoria: actividad.categoria || "KIDS",
      descripcion: actividad.descripcion || "",
      lugar: actividad.lugar || "",
      fecha: new Date(actividad.fecha).toISOString().slice(0, 10),
      horaInicio: actividad.horaInicio || "",
      horaFin: actividad.horaFin || "",
      edadMinima: actividad.edadMinima ?? 0,
      edadMaxima: actividad.edadMaxima ?? 99,
      cupoMaximo: actividad.cupoMaximo ?? 20,
    });
    setError("");
    setMostrarForm(true);
  }
  function cargar() {
    setCargando(true);
    setError("");

    api.listarActividades(token, "TODAS")
      .then(setActividades)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, [token]);

  function set(campo) {
    return (e) => {
      setForm({
        ...form,
        [campo]: e.target.value,
      });
    };
  }

  async function guardarActividad(e) {
    e.preventDefault();
    setError("");

    try {
      if (actividadEditando) {
        await api.editarActividad(token, actividadEditando.id, form);
        toast.success("Los cambios se guardaron correctamente.", {
          title: "Actividad actualizada",
        });
      } else {
        await api.crearActividad(token, form);
        toast.success("La actividad fue programada correctamente.", {
          title: "Actividad creada",
        });
      }

      setMostrarForm(false);
      setActividadEditando(null);
      limpiarFormulario();
      cargar();
    } catch (err) {
      setError(err.message);
      toast.error(err.message, {
        title: actividadEditando ? "Error al editar actividad" : "Error al crear actividad",
      });
    }
  }
  async function verParticipantes(actividad) {
    setParticipantesDe(actividad);
    setSeleccionados([]);
    setConfirmarEliminacion(false);
    setCargandoParticipantes(true);
    setError("");

    try {
      const data = await api.listarParticipantes(
        token,
        actividad.id
      );

      setParticipantes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoParticipantes(false);
    }
  }

  async function toggleAsistencia(inscripcionId, actual) {
    try {
      await api.marcarAsistencia(
        token,
        inscripcionId,
        !actual
      );

      toast.success(
        !actual
          ? "Asistencia confirmada para el participante."
          : "Asistencia desmarcada para el participante.",
        { title: "¡Asistencia actualizada!" }
      );

      const data = await api.listarParticipantes(
        token,
        participantesDe.id
      );

      setParticipantes(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "Error al registrar asistencia" });
    }
  }

  function toggleSeleccion(inscripcionId) {
    setSeleccionados((actuales) =>
      actuales.includes(inscripcionId)
        ? actuales.filter((id) => id !== inscripcionId)
        : [...actuales, inscripcionId]
    );
  }

  function toggleSeleccionarTodos() {
    setSeleccionados((actuales) =>
      actuales.length === participantes.length
        ? []
        : participantes.map((participante) => participante.id)
    );
  }

  async function eliminarReservasSeleccionadas() {
    if (seleccionados.length === 0) return;

    const cantidad = seleccionados.length;

    try {
      await api.cancelarInscripcionesActividad(token, seleccionados);
      const data = await api.listarParticipantes(token, participantesDe.id);
      setParticipantes(data);
      setSeleccionados([]);
      setConfirmarEliminacion(false);
      cargar();
      toast.success(
        cantidad === 1 ? "La reserva fue eliminada." : `${cantidad} reservas fueron eliminadas.`,
        { title: "Reservas actualizadas" }
      );
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "Error al eliminar reservas" });
    }
  }
  async function cancelarActividad(id) {
    if (!window.confirm("¿Cancelar esta actividad?")) {
      return;
    }

    try {
      await api.cancelarActividad(token, id);

      toast.success("La actividad fue cancelada correctamente.", {
        title: "¡Actividad cancelada!",
      });

      setParticipantesDe(null);
      setParticipantes([]);

      cargar();
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "Error al cancelar actividad" });
    }
  }

  const totalInscriptos = actividades.reduce(
    (total, actividad) =>
      total +
      (actividad.cupoMaximo - actividad.cuposDisponibles),
    0
  );

  return (
    <div className="app-frame">
      <BarraSuperior />

      <div style={{ padding: "10px 18px 32px" }}>

        {/* =========================
            ENCABEZADO
        ========================= */}

        <div
          style={{
            marginBottom: 18,
            paddingBottom: 14,
            borderBottom:
              "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                className="font-display"
                style={{
                  color: "var(--paper)",
                  fontSize: 26,
                  lineHeight: 1,
                }}
              >
                PANEL RECREADOR
              </div>

              <div
                className="font-mono"
                style={{
                  color: "var(--paper-2)",
                  opacity: 0.65,
                  fontSize: 10,
                  marginTop: 7,
                }}
              >
                Gestión de actividades y participantes
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {usuario?.rol === "ADMIN" && (
                <Link
                  to="/admin/instructores"
                  className="btn-ghost"
                  style={{
                    padding: "9px 14px",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    borderColor: "var(--gold)",
                    color: "var(--gold)",
                  }}
                >
                  👥 Instructores
                </Link>
              )}
              <button
                className="btn-primary"
                style={{
                  padding: "9px 14px",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  if (mostrarForm) {
                    setMostrarForm(false);
                    setActividadEditando(null);
                  } else {
                    abrirNuevaActividad();
                  }
                }}
              >
                {mostrarForm ? "Cerrar" : "+ Nueva"}
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            RESUMEN
        ========================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background:
                "rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div
              className="font-mono"
              style={{
                color: "var(--paper-2)",
                fontSize: 9,
                opacity: 0.65,
              }}
            >
              ACTIVIDADES
            </div>

            <div
              style={{
                color: "var(--paper)",
                fontSize: 22,
                fontWeight: 700,
                marginTop: 3,
              }}
            >
              {actividades.length}
            </div>
          </div>

          <div
            style={{
              background:
                "rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div
              className="font-mono"
              style={{
                color: "var(--paper-2)",
                fontSize: 9,
                opacity: 0.65,
              }}
            >
              INSCRIPTOS
            </div>

            <div
              style={{
                color: "var(--paper)",
                fontSize: 22,
                fontWeight: 700,
                marginTop: 3,
              }}
            >
              {totalInscriptos}
            </div>
          </div>
        </div>

        {/* =========================
            FORMULARIO NUEVA ACTIVIDAD
        ========================= */}

        {mostrarForm && (
          <form
            className="recreador-form"
            onSubmit={guardarActividad}
            style={{
              background: "var(--paper)",
              borderRadius: 14,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 14,
              }}
            >
              {actividadEditando ? "Editar actividad" : "Nueva actividad"}
            </div>

            <div className="form-field">
              <label className="form-label">
                Nombre
              </label>

              <input
                className="form-input"
                required
                value={form.nombre}
                onChange={set("nombre")}
                placeholder="Ej: Clase de tenis"
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Descripción
              </label>

              <input
                className="form-input"
                value={form.descripcion}
                onChange={set("descripcion")}
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Categoría
              </label>

              <select
                className="form-select"
                value={form.categoria}
                onChange={set("categoria")}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATS[c].label}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 10,
              }}
            >
              <div className="form-field">
                <label className="form-label">
                  Lugar
                </label>

                <input
                  className="form-input"
                  required
                  value={form.lugar}
                  onChange={set("lugar")}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Fecha
                </label>

                <input
                  className="form-input"
                  type="date"
                  value={form.fecha}
                  onChange={set("fecha")}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Hora inicio
                </label>

                <input
                  className="form-input"
                  value={form.horaInicio}
                  onChange={set("horaInicio")}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Hora fin
                </label>

                <input
                  className="form-input"
                  value={form.horaFin}
                  onChange={set("horaFin")}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Edad mínima
                </label>

                <input
                  className="form-input"
                  type="number"
                  value={form.edadMinima}
                  onChange={set("edadMinima")}
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Edad máxima
                </label>

                <input
                  className="form-input"
                  type="number"
                  value={form.edadMaxima}
                  onChange={set("edadMaxima")}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">
                Cupo máximo
              </label>

              <input
                className="form-input"
                type="number"
                value={form.cupoMaximo}
                onChange={set("cupoMaximo")}
              />
            </div>

            {error && (
              <div
                style={{
                  color: "#B23A2E",
                  fontSize: 12.5,
                  marginBottom: 10,
                }}
              >
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: "100%" }}
              type="submit"
            >
              {actividadEditando ? "Guardar cambios" : "Guardar actividad"}
            </button>
          </form>
        )}

        {/* =========================
            ESTADOS
        ========================= */}

        {cargando && (
          <p
            style={{
              color: "var(--paper-2)",
              opacity: 0.7,
            }}
          >
            Cargando actividades...
          </p>
        )}

        {error && !mostrarForm && (
          <div
            style={{
              color: "#B23A2E",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            LISTA DE ACTIVIDADES
        ========================= */}

        {!cargando &&
          actividades.map((a) => {
            const inscriptos =
              a.cupoMaximo -
              a.cuposDisponibles;

            const seleccionada =
              participantesDe?.id === a.id;

            return (
              <div
                key={a.id}
                style={{
                  background: "var(--paper)",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                {/* CABECERA ACTIVIDAD */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                      "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {a.nombre}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-soft)",
                        marginTop: 5,
                        lineHeight: 1.5,
                      }}
                    >
                      {a.horaInicio} - {a.horaFin}
                      <br />
                      {a.lugar}
                    </div>

                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 7,
                        fontSize: 9,
                        fontWeight: 700,
                        padding:
                          "4px 8px",
                        borderRadius: 20,
                        background:
                          "var(--paper-2)",
                      }}
                    >
                      {a.categoria}
                    </div>
                  </div>

                  {/* CUPOS */}

                  <div
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      background:
                        "var(--paper-2)",
                      padding: "5px 9px",
                      borderRadius: 20,
                      fontWeight: 600,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {inscriptos}/
                    {a.cupoMaximo} 👥
                  </div>
                </div>

                {/* ESTADO */}

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 10,
                    color:
                      a.estado ===
                        "CANCELADA"
                        ? "#B23A2E"
                        : "var(--text-soft)",
                  }}
                >
                  Estado: {a.estado}
                </div>

                {/* BOTONES */}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    className="btn-ghost"
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      fontSize: 10.5,
                      color:
                        "var(--text-soft)",
                      borderColor:
                        "rgba(27,43,39,0.2)",
                    }}
                    onClick={() =>
                      seleccionada
                        ? setParticipantesDe(
                          null
                        )
                        : verParticipantes(a)
                    }
                  >
                    {seleccionada
                      ? "Ocultar participantes"
                      : `Ver participantes (${inscriptos})`}
                  </button>

                  {a.estado !== "CANCELADA" && (
                    <button
                      className="btn-ghost"
                      style={{
                        padding: "8px 10px",
                        fontSize: 10.5,
                        color: "var(--text)",
                        borderColor: "rgba(27,43,39,0.2)",
                      }}
                      onClick={() => editarActividad(a)}
                    >
                      Editar
                    </button>
                  )}
                  {a.estado !==
                    "CANCELADA" && (
                      <button
                        className="btn-ghost"
                        style={{
                          padding:
                            "8px 10px",
                          fontSize: 10.5,
                          color: "#B23A2E",
                          borderColor:
                            "rgba(178,58,46,0.3)",
                        }}
                        onClick={() =>
                          cancelarActividad(
                            a.id
                          )
                        }
                      >
                        Cancelar
                      </button>
                    )}
                </div>

                {/* =========================
                    PARTICIPANTES
                ========================= */}

                {seleccionada && (
                  <div
                    style={{
                      marginTop: 14,
                      borderTop:
                        "1px solid var(--paper-2)",
                      paddingTop: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        Participantes
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color:
                            "var(--text-soft)",
                        }}
                      >
                        {participantes.length}
                      </div>
                    </div>

                    {!cargandoParticipantes && participantes.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <label style={{ fontSize: 10.5, color: "var(--text-soft)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={seleccionados.length === participantes.length}
                            onChange={toggleSeleccionarTodos}
                            style={{ marginRight: 6 }}
                          />
                          Seleccionar todos
                        </label>

                        <button
                          className="btn-ghost"
                          disabled={seleccionados.length === 0}
                          style={{
                            padding: "6px 9px",
                            fontSize: 9.5,
                            color: "#B23A2E",
                            borderColor: "rgba(178,58,46,0.3)",
                            opacity: seleccionados.length === 0 ? 0.45 : 1,
                          }}
                          type="button"
                          onClick={() => setConfirmarEliminacion(true)}
                        >
                          Eliminar ({seleccionados.length})
                        </button>
                      </div>
                    )}

                    {confirmarEliminacion && (
                      <div
                        style={{
                          background: "#FCE8E2",
                          border: "1px solid rgba(178,58,46,0.3)",
                          borderRadius: 10,
                          padding: 10,
                          marginBottom: 10,
                          fontSize: 11,
                          color: "var(--text)",
                        }}
                      >
                        <div style={{ marginBottom: 8 }}>
                          {seleccionados.length === 1
                            ? "¿Confirmás eliminar esta reserva?"
                            : `¿Confirmás eliminar las ${seleccionados.length} reservas seleccionadas?`}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 7 }}>
                          <button
                            className="btn-ghost"
                            type="button"
                            style={{ padding: "5px 8px", fontSize: 9.5 }}
                            onClick={() => setConfirmarEliminacion(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            className="btn-ghost"
                            type="button"
                            style={{
                              padding: "5px 8px",
                              fontSize: 9.5,
                              color: "#B23A2E",
                              borderColor: "rgba(178,58,46,0.4)",
                            }}
                            onClick={eliminarReservasSeleccionadas}
                          >
                            Confirmar eliminación
                          </button>
                        </div>
                      </div>
                    )}

                    {cargandoParticipantes && (
                      <div
                        style={{
                          fontSize: 11,
                          color:
                            "var(--text-soft)",
                        }}
                      >
                        Cargando participantes...
                      </div>
                    )}

                    {!cargandoParticipantes &&
                      participantes.length ===
                      0 && (
                        <div
                          style={{
                            fontSize: 12,
                            color:
                              "var(--text-soft)",
                          }}
                        >
                          Sin inscriptos
                          todavía.
                        </div>
                      )}

                    {!cargandoParticipantes &&
                      participantes.map(
                        (p) => (
                          <div
                            key={p.id}
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap: 10,
                              padding:
                                "9px 0",
                              borderBottom:
                                "1px solid var(--paper-2)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <input
                                type="checkbox"
                                aria-label={`Seleccionar reserva de ${p.usuario.nombre}`}
                                checked={seleccionados.includes(p.id)}
                                onChange={() => toggleSeleccion(p.id)}
                                style={{ marginTop: 3 }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontSize:
                                    12.5,
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  p.usuario
                                    .nombre
                                }{" "}
                                {
                                  p.usuario
                                    .apellido
                                }
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    10.5,
                                  color:
                                    "var(--text-soft)",
                                  marginTop: 3,
                                }}
                              >
                                Hab.{" "}
                                {p.usuario
                                  .habitacion ||
                                  "—"}
                              </div>

                              {p.estado ===
                                "LISTA_ESPERA" && (
                                  <div
                                    style={{
                                      fontSize:
                                        10,
                                      color:
                                        "#B23A2E",
                                      marginTop:
                                        3,
                                    }}
                                  >
                                    Lista de
                                    espera
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              className="btn-ghost"
                              style={{
                                padding:
                                  "6px 9px",
                                fontSize:
                                  9.5,
                                whiteSpace:
                                  "nowrap",
                                borderColor:
                                  p.asistio
                                    ? "#1F7A4D"
                                    : "rgba(27,43,39,0.2)",
                                color:
                                  p.asistio
                                    ? "#1F7A4D"
                                    : "var(--text-soft)",
                              }}
                              onClick={() =>
                                toggleAsistencia(
                                  p.id,
                                  p.asistio
                                )
                              }
                            >
                              {p.asistio
                                ? "✓ Asistió"
                                : "Marcar asistencia"}
                            </button>
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}