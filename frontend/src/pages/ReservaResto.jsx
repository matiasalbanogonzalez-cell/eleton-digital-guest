import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Coffee,
    UtensilsCrossed,
    CupSoda,
    Moon,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Home,
} from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { api } from "../api/client";

const ICONOS_SERVICIO = {
    DESAYUNO: Coffee,
    ALMUERZO: UtensilsCrossed,
    MERIENDA: CupSoda,
    CENA: Moon,
};

const LABELS_SERVICIO = {
    DESAYUNO: "Desayuno",
    ALMUERZO: "Almuerzo",
    MERIENDA: "Merienda",
    CENA: "Cena",
};

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function ReservaResto() {
    const [paso, setPaso] = useState(1);
    const [servicios, setServicios] = useState([]);
    const [cargandoServicios, setCargandoServicios] = useState(true);
    const [errorServicios, setErrorServicios] = useState("");

    const [servicioId, setServicioId] = useState("");
    const [horarios, setHorarios] = useState([]);
    const [horarioId, setHorarioId] = useState("");
    const [fecha, setFecha] = useState(hoyISO());
    const [personas, setPersonas] = useState(2);

    const [nombre, setNombre] = useState("");
    const [habitacion, setHabitacion] = useState("");

    const [consultando, setConsultando] = useState(false);
    const [disponible, setDisponible] = useState(null);
    const [lugaresDisponibles, setLugaresDisponibles] = useState(null);
    const [error, setError] = useState("");

    const [confirmando, setConfirmando] = useState(false);
    const [reserva, setReserva] = useState(null);

    useEffect(() => {
        api
            .listarServiciosResto()
            .then((data) => {
                setServicios(data);
                if (!data || data.length === 0) {
                    setErrorServicios(
                        "No hay servicios de Restó cargados todavía. Verificá que el backend esté corriendo y que se haya ejecutado el seed (node prisma/seed.js)."
                    );
                }
            })
            .catch((err) => {
                setServicios([]);
                setErrorServicios(
                    `No se pudo conectar con el servidor (${err.message}). Verificá que el backend esté corriendo y que VITE_API_URL apunte a la URL correcta.`
                );
            })
            .finally(() => setCargandoServicios(false));
    }, []);

    async function elegirServicio(id) {
        setServicioId(id);
        setHorarioId("");
        try {
            const data = await api.listarHorariosResto(id);
            setHorarios(data);
        } catch {
            setHorarios([]);
        }
        setPaso(2);
    }

    function irAPersonas() {
        if (!fecha) return;
        if (horarios.length > 0 && !horarioId) return;
        setPaso(3);
    }

    async function consultarDisponibilidad() {
        setError("");
        setConsultando(true);
        setDisponible(null);
        setLugaresDisponibles(null);
        try {
            const data = await api.consultarDisponibilidadResto(fecha, servicioId, personas, horarioId);
            setDisponible(data.disponible);
            setLugaresDisponibles(data.lugaresDisponibles);
            setPaso(4);
        } catch (err) {
            setError(err.message);
        } finally {
            setConsultando(false);
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
            const data = await api.crearReservaResto({
                servicioId,
                horarioId: horarioId || undefined,
                fecha,
                personas: Number(personas),
                nombre: nombre.trim(),
                habitacion: habitacion.trim(),
            });
            setReserva(data);
            setPaso(5);
        } catch (err) {
            setError(err.message);
        } finally {
            setConfirmando(false);
        }
    }

    const servicioElegido = servicios.find((s) => s.id === servicioId);

    return (
        <PublicLayout>
            <section className="placeholder-hero resto-reserva-hero">
                <Link to="/resto" className="btn-ghost placeholder-back">
                    ← Restó
                </Link>

                <div className="section-title-eyebrow font-mono">Reservar mesa</div>
                <h1 className="hero-title font-display spa-hero-title">Eleton Restó &amp; Grill</h1>

                {paso < 5 && (
                    <div className="resto-progress">
                        {[1, 2, 3, 4].map((n) => (
                            <span key={n} className={`resto-progress-dot ${paso >= n ? "is-active" : ""}`} />
                        ))}
                    </div>
                )}
            </section>

            <section className="resto-reserva-section">
                {/* PASO 1: servicio */}
                {paso === 1 && (
                    <div className="resto-step-card">
                        <h2 className="section-title font-display">¿Qué querés reservar?</h2>
                        {cargandoServicios && <p className="resto-step-loading">Cargando servicios…</p>}
                        {!cargandoServicios && errorServicios && (
                            <div className="resto-error" style={{ marginTop: 14 }}>{errorServicios}</div>
                        )}
                        {!cargandoServicios && !errorServicios && (
                            <div className="resto-servicio-grid">
                                {servicios.map((s) => {
                                    const Icon = ICONOS_SERVICIO[s.nombre] || UtensilsCrossed;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            className="resto-servicio-btn"
                                            onClick={() => elegirServicio(s.id)}
                                        >
                                            <span className="spa-service-icon">
                                                <Icon size={20} />
                                            </span>
                                            <span>{LABELS_SERVICIO[s.nombre] || s.nombre}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 2: horario (si aplica) + fecha */}
                {paso === 2 && (
                    <div className="resto-step-card">
                        <h2 className="section-title font-display">¿Para qué fecha?</h2>
                        <p className="section-title-sub">
                            {LABELS_SERVICIO[servicioElegido?.nombre] || ""}
                        </p>

                        {horarios.length > 0 && (
                            <div className="form-field" style={{ marginTop: 16 }}>
                                <label className="form-label">Horario</label>
                                <div className="resto-horario-grid">
                                    {horarios.map((h) => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            className={`resto-horario-btn ${horarioId === h.id ? "is-selected" : ""}`}
                                            onClick={() => setHorarioId(h.id)}
                                        >
                                            <Clock size={15} />
                                            {h.hora}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-field" style={{ marginTop: 16 }}>
                            <label className="form-label">Fecha</label>
                            <input
                                className="form-input"
                                type="date"
                                min={hoyISO()}
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                            />
                        </div>

                        <div className="resto-step-actions">
                            <button type="button" className="btn-ghost" onClick={() => setPaso(1)}>
                                ← Volver
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={irAPersonas}
                                disabled={horarios.length > 0 && !horarioId}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3: personas */}
                {paso === 3 && (
                    <div className="resto-step-card">
                        <h2 className="section-title font-display">¿Cuántas personas?</h2>

                        <div className="resto-stepper">
                            <button
                                type="button"
                                className="resto-stepper-btn"
                                onClick={() => setPersonas((p) => Math.max(1, p - 1))}
                            >
                                −
                            </button>
                            <span className="resto-stepper-value">
                                <Users size={16} />
                                {personas}
                            </span>
                            <button
                                type="button"
                                className="resto-stepper-btn"
                                onClick={() => setPersonas((p) => Math.min(20, p + 1))}
                            >
                                +
                            </button>
                        </div>

                        {error && <div className="resto-error">{error}</div>}

                        <div className="resto-step-actions">
                            <button type="button" className="btn-ghost" onClick={() => setPaso(2)}>
                                ← Volver
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={consultarDisponibilidad}
                                disabled={consultando}
                            >
                                {consultando ? "Consultando…" : "Ver disponibilidad"}
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 4: disponibilidad + confirmar */}
                {paso === 4 && (
                    <div className="resto-step-card">
                        {disponible ? (
                            <>
                                <div className="resto-disponibilidad-msg is-ok">
                                    <CheckCircle2 size={20} />
                                    <span>
                                        Hay disponibilidad para {personas} persona{personas > 1 ? "s" : ""}.
                                        {typeof lugaresDisponibles === "number" && (
                                            <> Quedan <strong>{lugaresDisponibles}</strong> lugares para este turno.</>
                                        )}
                                    </span>
                                </div>

                                <form onSubmit={confirmarReserva} className="resto-confirm-form">
                                    <div className="form-field">
                                        <label className="form-label">Nombre y apellido</label>
                                        <input
                                            className="form-input"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Tu nombre"
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Habitación</label>
                                        <input
                                            className="form-input"
                                            value={habitacion}
                                            onChange={(e) => setHabitacion(e.target.value)}
                                            placeholder="Ej: 204"
                                            required
                                        />
                                    </div>

                                    {error && <div className="resto-error">{error}</div>}

                                    <div className="resto-step-actions">
                                        <button type="button" className="btn-ghost" onClick={() => setPaso(3)}>
                                            ← Volver
                                        </button>
                                        <button type="submit" className="btn-primary" disabled={confirmando}>
                                            {confirmando ? "Confirmando…" : "Confirmar reserva"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="resto-disponibilidad-msg is-error">
                                    <XCircle size={20} />
                                    <span>No hay disponibilidad para esta fecha y horario.</span>
                                </div>
                                <div className="resto-step-actions">
                                    <button type="button" className="btn-ghost" onClick={() => setPaso(2)}>
                                        ← Elegir otra fecha
                                    </button>
                                    <button type="button" className="btn-primary" onClick={() => setPaso(3)}>
                                        Cambiar personas
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* PASO 5: confirmada */}
                {paso === 5 && reserva && (
                    <div className="resto-step-card resto-confirm-card">
                        <div className="resto-confirm-check">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="section-title font-display">¡Reserva confirmada!</h2>

                        <div className="resto-confirm-summary">
                            <div className="resto-confirm-row">
                                <span className="info-label">Servicio</span>
                                <p>
                                    {LABELS_SERVICIO[reserva.servicio?.nombre] || reserva.servicio?.nombre}
                                    {reserva.horario?.hora ? ` · ${reserva.horario.hora}` : ""}
                                </p>
                            </div>
                            <div className="resto-confirm-row">
                                <span className="info-label">Fecha</span>
                                <p>{new Date(reserva.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })}</p>
                            </div>
                            <div className="resto-confirm-row">
                                <span className="info-label">Personas</span>
                                <p>{reserva.personas}</p>
                            </div>
                            <div className="resto-confirm-row">
                                <span className="info-label">Salón asignado</span>
                                <p>{reserva.salon?.nombre}</p>
                            </div>
                            <div className="resto-confirm-row">
                                <span className="info-label">N° de reserva</span>
                                <p className="font-mono">{reserva.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        <Link to="/resto" className="btn-primary resto-confirm-btn">
                            <Home size={16} />
                            Volver a Restó
                        </Link>
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}