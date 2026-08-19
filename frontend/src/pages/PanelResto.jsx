import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const SERVICIO_LABEL = { DESAYUNO: "Desayuno", ALMUERZO: "Almuerzo", MERIENDA: "Merienda", CENA: "Cena" };
const SERVICIO_HORARIO = {
    DESAYUNO: "08:00–10:30",
    ALMUERZO: "12:30–15:00",
    MERIENDA: "16:00–18:00",
    CENA: "20:30–23:30",
};
const ESTADO_LABEL = { CONFIRMADA: "Confirmada", CANCELADA: "Cancelada", COMPLETADA: "Completada" };
const ESTADO_COLOR = { CONFIRMADA: "#1F7A4D", CANCELADA: "#B23A2E", COMPLETADA: "var(--text-soft)" };

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function PanelResto() {
    const { token } = useAuth();

    const [fechaFiltro, setFechaFiltro] = useState(hoyISO());
    const [servicioFiltro, setServicioFiltro] = useState("");
    const [salonFiltro, setSalonFiltro] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");

    const [resumen, setResumen] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [salones, setSalones] = useState([]);
    const [configDisponibilidad, setConfigDisponibilidad] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [seccion, setSeccion] = useState("reservas"); // "reservas" | "salones" | "disponibilidad"

    const [editandoSalonId, setEditandoSalonId] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: "", mesas: "", capacidadPersonas: "" });
    const [mostrarNuevoSalon, setMostrarNuevoSalon] = useState(false);
    const [nuevoSalon, setNuevoSalon] = useState({ nombre: "", mesas: "", capacidadPersonas: "" });
    const [error, setError] = useState("");

    const cargarTodo = useCallback(() => {
        setCargando(true);
        Promise.all([
            api.panelResto(token, fechaFiltro),
            api.listarReservasResto(token, {
                fecha: fechaFiltro,
                servicioId: servicioFiltro,
                salonId: salonFiltro,
                estado: estadoFiltro,
            }),
            api.listarServiciosResto(),
            api.listarSalonesResto(token),
            api.configDisponibilidadResto(token, fechaFiltro),
        ])
            .then(([resumenData, reservasData, serviciosData, salonesData, configData]) => {
                setResumen(resumenData);
                setReservas(reservasData);
                setServicios(serviciosData);
                setSalones(salonesData);
                setConfigDisponibilidad(configData.config);
            })
            .catch((err) => setError(err.message))
            .finally(() => setCargando(false));
    }, [token, fechaFiltro, servicioFiltro, salonFiltro, estadoFiltro]);

    useEffect(cargarTodo, [cargarTodo]);

    async function cancelar(id) {
        await api.cancelarReservaResto(token, id);
        cargarTodo();
    }

    function iniciarEdicion(salon) {
        setEditandoSalonId(salon.id);
        setEditForm({ nombre: salon.nombre, mesas: salon.mesas, capacidadPersonas: salon.capacidadPersonas });
    }

    async function guardarEdicion(id) {
        await api.editarSalonResto(token, id, editForm);
        setEditandoSalonId(null);
        cargarTodo();
    }

    async function toggleActivo(id) {
        await api.toggleEstadoSalonResto(token, id);
        cargarTodo();
    }

    async function crearSalon(e) {
        e.preventDefault();
        setError("");
        try {
            await api.crearSalonResto(token, nuevoSalon);
            setNuevoSalon({ nombre: "", mesas: "", capacidadPersonas: "" });
            setMostrarNuevoSalon(false);
            cargarTodo();
        } catch (err) {
            setError(err.message);
        }
    }

    async function toggleDisponibilidad(item) {
        await api.actualizarConfigDisponibilidadResto(token, {
            salonId: item.salonId,
            servicioId: item.servicioId,
            fecha: fechaFiltro,
            habilitado: !item.habilitado,
        });
        cargarTodo();
    }

    const cardStyle = { background: "var(--paper)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 };
    const tabStyle = (activa) => ({
        padding: "8px 14px",
        borderRadius: 20,
        fontSize: 11.5,
        fontFamily: "'IBM Plex Mono'",
        cursor: "pointer",
        border: activa ? "none" : "1px solid rgba(255,255,255,0.15)",
        background: activa ? "var(--gold)" : "transparent",
        color: activa ? "var(--ink)" : "var(--paper-2)",
        fontWeight: activa ? 700 : 400,
    });

    return (
        <div className="app-frame">
            <div style={{ padding: "16px 18px 10px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                        <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>
                            Panel Restó
                        </div>
                        <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
                            ADMINISTRACIÓN
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Link to="/resto" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>
                            Ver como huésped
                        </Link>
                        <Link to="/" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>
                            ← Inicio
                        </Link>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
                    <span style={tabStyle(seccion === "reservas")} onClick={() => setSeccion("reservas")}>Reservas</span>
                    <span style={tabStyle(seccion === "salones")} onClick={() => setSeccion("salones")}>Salones</span>
                    <span style={tabStyle(seccion === "disponibilidad")} onClick={() => setSeccion("disponibilidad")}>Disponibilidad</span>
                </div>

                {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
                {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

                {!cargando && resumen && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                        {[
                            ["Reservas de hoy", resumen.reservasHoy],
                            ["Personas", resumen.personas],
                            ["Mesas ocupadas", resumen.mesasOcupadas],
                            ["Disponibilidad", `${resumen.mesasDisponibles} mesas`],
                        ].map(([label, valor]) => (
                            <div key={label} className="info-card">
                                <div className="info-label">{label}</div>
                                <div className="info-value">{valor}</div>
                            </div>
                        ))}
                    </div>
                )}

                {!cargando && seccion === "reservas" && (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label className="form-label">Fecha</label>
                                <input className="form-input" type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label className="form-label">Servicio</label>
                                <select className="form-select" value={servicioFiltro} onChange={(e) => setServicioFiltro(e.target.value)}>
                                    <option value="">Todos</option>
                                    {servicios.map((s) => (
                                        <option key={s.id} value={s.id}>{SERVICIO_LABEL[s.nombre] || s.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label className="form-label">Salón</label>
                                <select className="form-select" value={salonFiltro} onChange={(e) => setSalonFiltro(e.target.value)}>
                                    <option value="">Todos</option>
                                    {salones.map((s) => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label className="form-label">Estado</label>
                                <select className="form-select" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="CONFIRMADA">Confirmada</option>
                                    <option value="CANCELADA">Cancelada</option>
                                    <option value="COMPLETADA">Completada</option>
                                </select>
                            </div>
                        </div>

                        {reservas.length === 0 && (
                            <p style={{ color: "var(--paper-2)", opacity: 0.6, fontSize: 12.5 }}>No hay reservas para este filtro.</p>
                        )}

                        {reservas.map((r) => (
                            <div key={r.id} style={cardStyle}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.nombre}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                                            Hab. {r.habitacion} · {r.personas} pers. · {SERVICIO_LABEL[r.servicio?.nombre]}
                                            {r.horario?.hora ? ` (${r.horario.hora})` : ` (${SERVICIO_HORARIO[r.servicio?.nombre] || ""})`}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Salón: {r.salon?.nombre}</div>
                                    </div>
                                    <span
                                        className="font-mono"
                                        style={{
                                            fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
                                            background: "var(--paper-2)", color: ESTADO_COLOR[r.estado],
                                        }}
                                    >
                                        {ESTADO_LABEL[r.estado]}
                                    </span>
                                </div>
                                {r.estado === "CONFIRMADA" && (
                                    <div style={{ marginTop: 10 }}>
                                        <button
                                            className="btn-ghost"
                                            style={{ padding: "6px 12px", fontSize: 10.5, color: "#B23A2E", borderColor: "rgba(178,58,46,0.3)" }}
                                            onClick={() => cancelar(r.id)}
                                        >
                                            Cancelar reserva
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {!cargando && seccion === "salones" && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div className="font-display" style={{ color: "var(--paper)", fontSize: 18 }}>Configuración de salones</div>
                            <button className="btn-primary" style={{ padding: "8px 12px", fontSize: 11 }} onClick={() => setMostrarNuevoSalon(!mostrarNuevoSalon)}>
                                {mostrarNuevoSalon ? "Cerrar" : "+ Nuevo"}
                            </button>
                        </div>

                        {mostrarNuevoSalon && (
                            <form onSubmit={crearSalon} style={{ background: "var(--paper)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                                <div className="form-field">
                                    <label className="form-label">Nombre</label>
                                    <input className="form-input" required value={nuevoSalon.nombre} onChange={(e) => setNuevoSalon({ ...nuevoSalon, nombre: e.target.value })} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div className="form-field">
                                        <label className="form-label">Mesas</label>
                                        <input className="form-input" type="number" required value={nuevoSalon.mesas} onChange={(e) => setNuevoSalon({ ...nuevoSalon, mesas: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Capacidad (personas)</label>
                                        <input className="form-input" type="number" required value={nuevoSalon.capacidadPersonas} onChange={(e) => setNuevoSalon({ ...nuevoSalon, capacidadPersonas: e.target.value })} />
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ width: "100%" }} type="submit">Guardar salón</button>
                            </form>
                        )}

                        {salones.map((s) => (
                            <div key={s.id} style={cardStyle}>
                                {editandoSalonId === s.id ? (
                                    <>
                                        <div className="form-field">
                                            <label className="form-label">Nombre</label>
                                            <input className="form-input" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            <div className="form-field">
                                                <label className="form-label">Mesas</label>
                                                <input className="form-input" type="number" value={editForm.mesas} onChange={(e) => setEditForm({ ...editForm, mesas: e.target.value })} />
                                            </div>
                                            <div className="form-field">
                                                <label className="form-label">Capacidad</label>
                                                <input className="form-input" type="number" value={editForm.capacidadPersonas} onChange={(e) => setEditForm({ ...editForm, capacidadPersonas: e.target.value })} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 10.5 }} onClick={() => guardarEdicion(s.id)}>Guardar</button>
                                            <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }} onClick={() => setEditandoSalonId(null)}>Cancelar</button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.nombre}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                                                {s.mesas} mesas · {s.capacidadPersonas} personas · {s.activo ? "Activo" : "Inactivo"}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }} onClick={() => iniciarEdicion(s)}>Editar</button>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: "6px 12px", fontSize: 10.5, color: s.activo ? "#B23A2E" : "#1F7A4D" }}
                                                onClick={() => toggleActivo(s.id)}
                                            >
                                                {s.activo ? "Desactivar" : "Activar"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {!cargando && seccion === "disponibilidad" && (
                    <>
                        <div className="form-field">
                            <label className="form-label">Fecha a configurar</label>
                            <input className="form-input" type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
                        </div>
                        <p style={{ fontSize: 11.5, color: "var(--paper-2)", opacity: 0.65, marginBottom: 14 }}>
                            Tocá cada servicio para habilitar o deshabilitar el salón en esa fecha. El huésped nunca ve esta pantalla.
                        </p>

                        {salones.map((salon) => (
                            <div key={salon.id} style={cardStyle}>
                                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>{salon.nombre}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {configDisponibilidad
                                        .filter((c) => c.salonId === salon.id)
                                        .map((c) => (
                                            <button
                                                key={`${c.salonId}_${c.servicioId}`}
                                                className="btn-ghost"
                                                style={{
                                                    padding: "6px 10px",
                                                    fontSize: 10.5,
                                                    borderColor: c.habilitado ? "#1F7A4D" : "rgba(178,58,46,0.3)",
                                                    color: c.habilitado ? "#1F7A4D" : "#B23A2E",
                                                }}
                                                onClick={() => toggleDisponibilidad(c)}
                                            >
                                                {SERVICIO_LABEL[c.servicioNombre] || c.servicioNombre} · {c.habilitado ? "Habilitado" : "Deshabilitado"}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}