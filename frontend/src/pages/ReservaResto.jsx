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
import { useToast } from "../context/ToastContext";

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
    const { toast } = useToast();
    const [paso, setPaso] = useState(1);

    // SERVICIOS
    const [servicios, setServicios] = useState([]);
    const [cargandoServicios, setCargandoServicios] = useState(true);
    const [errorServicios, setErrorServicios] = useState("");

    // RESERVA
    const [servicioId, setServicioId] = useState("");
    const [horarios, setHorarios] = useState([]);
    const [horarioId, setHorarioId] = useState("");
    const [fecha, setFecha] = useState(hoyISO());

    // PERSONAS
    const [personas, setPersonas] = useState(2);

    // DATOS DEL HUÉSPED
    const [nombre, setNombre] = useState("");
    const [habitacion, setHabitacion] = useState("");

    // DISPONIBILIDAD
    const [consultando, setConsultando] = useState(false);
    const [disponible, setDisponible] = useState(null);
    const [lugaresDisponibles, setLugaresDisponibles] = useState(null);
    const [error, setError] = useState("");

    // CONFIRMACIÓN
    const [confirmando, setConfirmando] = useState(false);
    const [reserva, setReserva] = useState(null);

    // ============================================================
    // CARGAR SERVICIOS
    // ============================================================

    useEffect(() => {
        api.listarServiciosResto()
            .then((data) => {
                setServicios(data);

                if (!data || data.length === 0) {
                    setErrorServicios(
                        "No hay servicios de Restó cargados todavía."
                    );
                }
            })
            .catch((err) => {
                setServicios([]);

                setErrorServicios(
                    `No se pudo conectar con el servidor (${err.message}).`
                );
            })
            .finally(() => {
                setCargandoServicios(false);
            });
    }, []);

    // ============================================================
    // ELEGIR SERVICIO
    // ============================================================

    async function elegirServicio(id) {
        setServicioId(id);
        setHorarioId("");
        setError("");

        try {
            const data = await api.listarHorariosResto(id);
            setHorarios(data || []);
        } catch (err) {
            console.error("Error cargando horarios:", err);
            setHorarios([]);
        }

        setPaso(2);
    }

    // ============================================================
    // PASO 2 → PASO 3
    // ============================================================

    function irAPersonas() {
        if (!fecha) {
            setError("Seleccioná una fecha.");
            return;
        }

        if (horarios.length > 0 && !horarioId) {
            setError("Seleccioná un horario.");
            return;
        }

        setError("");
        setPaso(3);
    }

    // ============================================================
    // CAMBIAR CANTIDAD DE PERSONAS
    // ============================================================

    function disminuirPersonas() {
        setPersonas((actual) => {
            const nuevoValor = Math.max(1, Number(actual) - 1);
            return nuevoValor;
        });
    }

    function aumentarPersonas() {
        setPersonas((actual) => {
            const nuevoValor = Math.min(20, Number(actual) + 1);
            return nuevoValor;
        });
    }

    // ============================================================
    // CONSULTAR DISPONIBILIDAD
    // ============================================================

    async function consultarDisponibilidad() {
        setError("");
        setConsultando(true);
        setDisponible(null);
        setLugaresDisponibles(null);

        try {
            const data = await api.consultarDisponibilidadResto(
                fecha,
                servicioId,
                Number(personas),
                horarioId
            );

            setDisponible(data.disponible);
            setLugaresDisponibles(data.lugaresDisponibles);

            setPaso(4);
        } catch (err) {
            console.error("Error consultando disponibilidad:", err);
            setError(err.message);
        } finally {
            setConsultando(false);
        }
    }

    // ============================================================
    // CONFIRMAR RESERVA
    // ============================================================

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
            toast.success("Tu reserva de mesa se realizó correctamente.", {
                title: "¡Reserva exitosa!",
            });
        } catch (err) {
            console.error("Error confirmando reserva:", err);
            setError(err.message);
            toast.error(err.message, { title: "Error al reservar" });
        } finally {
            setConfirmando(false);
        }
    }

    const servicioElegido = servicios.find(
        (s) => s.id === servicioId
    );

    return (
        <PublicLayout>

            {/* ======================================================
                HERO
            ====================================================== */}

            <section className="placeholder-hero resto-reserva-hero">

                <Link
                    to="/resto"
                    className="btn-ghost placeholder-back"
                >
                    ← Restó
                </Link>

                <div className="section-title-eyebrow font-mono">
                    Reservar mesa
                </div>

                <h1 className="hero-title font-display spa-hero-title">
                    Eleton Restó &amp; Grill
                </h1>

                {paso < 5 && (
                    <div className="resto-progress">
                        {[1, 2, 3, 4].map((n) => (
                            <span
                                key={n}
                                className={`resto-progress-dot ${paso >= n ? "is-active" : ""
                                    }`}
                            />
                        ))}
                    </div>
                )}

            </section>

            <section className="resto-reserva-section">

                {/* ==================================================
                    PASO 1 — SERVICIO
                ================================================== */}

                {paso === 1 && (
                    <div className="resto-step-card">

                        <h2 className="section-title font-display">
                            ¿Qué querés reservar?
                        </h2>

                        {cargandoServicios && (
                            <p className="resto-step-loading">
                                Cargando servicios…
                            </p>
                        )}

                        {!cargandoServicios && errorServicios && (
                            <div
                                className="resto-error"
                                style={{ marginTop: 14 }}
                            >
                                {errorServicios}
                            </div>
                        )}

                        {!cargandoServicios &&
                            !errorServicios && (
                                <div className="resto-servicio-grid">

                                    {servicios.map((s) => {

                                        const Icon =
                                            ICONOS_SERVICIO[s.nombre] ||
                                            UtensilsCrossed;

                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                className="resto-servicio-btn"
                                                onClick={() =>
                                                    elegirServicio(s.id)
                                                }
                                            >

                                                <span className="spa-service-icon">
                                                    <Icon size={20} />
                                                </span>

                                                <span>
                                                    {LABELS_SERVICIO[
                                                        s.nombre
                                                    ] || s.nombre}
                                                </span>

                                            </button>
                                        );
                                    })}

                                </div>
                            )}

                    </div>
                )}

                {/* ==================================================
                    PASO 2 — FECHA Y HORARIO
                ================================================== */}

                {paso === 2 && (
                    <div className="resto-step-card">

                        <h2 className="section-title font-display">
                            ¿Para qué fecha?
                        </h2>

                        <p className="section-title-sub">
                            {LABELS_SERVICIO[
                                servicioElegido?.nombre
                            ] || ""}
                        </p>

                        {horarios.length > 0 && (
                            <div
                                className="form-field"
                                style={{ marginTop: 16 }}
                            >

                                <label className="form-label">
                                    Horario
                                </label>

                                <div className="resto-horario-grid">

                                    {horarios.map((h) => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            className={`resto-horario-btn ${horarioId === h.id
                                                    ? "is-selected"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                setHorarioId(h.id)
                                            }
                                        >

                                            <Clock size={15} />

                                            {h.hora}

                                        </button>
                                    ))}

                                </div>

                            </div>
                        )}

                        <div
                            className="form-field"
                            style={{ marginTop: 16 }}
                        >

                            <label className="form-label">
                                Fecha
                            </label>

                            <input
                                className="form-input"
                                type="date"
                                min={hoyISO()}
                                value={fecha}
                                onChange={(e) =>
                                    setFecha(e.target.value)
                                }
                            />

                        </div>

                        {error && (
                            <div className="resto-error">
                                {error}
                            </div>
                        )}

                        <div className="resto-step-actions">

                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => {
                                    setError("");
                                    setPaso(1);
                                }}
                            >
                                ← Volver
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={irAPersonas}
                                disabled={
                                    !fecha ||
                                    (horarios.length > 0 &&
                                        !horarioId)
                                }
                            >
                                Continuar
                            </button>

                        </div>

                    </div>
                )}

                {/* ==================================================
                    PASO 3 — PERSONAS
                ================================================== */}

                {paso === 3 && (
                    <div className="resto-step-card">

                        <h2 className="section-title font-display">
                            ¿Cuántas personas?
                        </h2>

                        {/* CONTADOR */}

                        <div
                            className="resto-stepper"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "20px",
                                margin: "30px 0",
                            }}
                        >

                            {/* MENOS */}

                            <button
                                type="button"
                                className="resto-stepper-btn"
                                onClick={disminuirPersonas}
                                disabled={personas <= 1}
                                style={{
                                    width: "52px",
                                    height: "52px",
                                    fontSize: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor:
                                        personas <= 1
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                −
                            </button>

                            {/* NÚMERO */}

                            <div
                                className="resto-stepper-value"
                                style={{
                                    minWidth: "90px",
                                    height: "60px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    borderRadius: "12px",
                                }}
                            >

                                <Users size={22} />

                                <span>
                                    {personas}
                                </span>

                            </div>

                            {/* MÁS */}

                            <button
                                type="button"
                                className="resto-stepper-btn"
                                onClick={aumentarPersonas}
                                disabled={personas >= 20}
                                style={{
                                    width: "52px",
                                    height: "52px",
                                    fontSize: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor:
                                        personas >= 20
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                +
                            </button>

                        </div>

                        {/* INFORMACIÓN */}

                        <p
                            style={{
                                textAlign: "center",
                                marginBottom: "20px",
                            }}
                        >
                            Cantidad de personas:
                            <strong style={{ marginLeft: "6px" }}>
                                {personas}
                            </strong>
                        </p>

                        {error && (
                            <div className="resto-error">
                                {error}
                            </div>
                        )}

                        <div className="resto-step-actions">

                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => {
                                    setError("");
                                    setPaso(2);
                                }}
                            >
                                ← Volver
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={consultarDisponibilidad}
                                disabled={consultando}
                            >
                                {consultando
                                    ? "Consultando…"
                                    : "Ver disponibilidad"}
                            </button>

                        </div>

                    </div>
                )}

                {/* ==================================================
                    PASO 4 — DISPONIBILIDAD
                ================================================== */}

                {paso === 4 && (
                    <div className="resto-step-card">

                        {disponible ? (
                            <>

                                <div className="resto-disponibilidad-msg is-ok">

                                    <CheckCircle2 size={20} />

                                    <span>
                                        Hay disponibilidad para{" "}
                                        {personas}{" "}
                                        persona
                                        {personas > 1 ? "s" : ""}.

                                        {typeof lugaresDisponibles ===
                                            "number" && (
                                                <>
                                                    {" "}
                                                    Quedan{" "}
                                                    <strong>
                                                        {
                                                            lugaresDisponibles
                                                        }
                                                    </strong>{" "}
                                                    lugares para este turno.
                                                </>
                                            )}
                                    </span>

                                </div>

                                <form
                                    onSubmit={confirmarReserva}
                                    className="resto-confirm-form"
                                >

                                    <div className="form-field">

                                        <label className="form-label">
                                            Nombre y apellido
                                        </label>

                                        <input
                                            className="form-input"
                                            value={nombre}
                                            onChange={(e) =>
                                                setNombre(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Tu nombre"
                                            required
                                        />

                                    </div>

                                    <div className="form-field">

                                        <label className="form-label">
                                            Habitación
                                        </label>

                                        <input
                                            className="form-input"
                                            value={habitacion}
                                            onChange={(e) =>
                                                setHabitacion(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej: 204"
                                            required
                                        />

                                    </div>

                                    {error && (
                                        <div className="resto-error">
                                            {error}
                                        </div>
                                    )}

                                    <div className="resto-step-actions">

                                        <button
                                            type="button"
                                            className="btn-ghost"
                                            onClick={() => {
                                                setError("");
                                                setPaso(3);
                                            }}
                                        >
                                            ← Volver
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={confirmando}
                                        >
                                            {confirmando
                                                ? "Confirmando…"
                                                : "Confirmar reserva"}
                                        </button>

                                    </div>

                                </form>

                            </>
                        ) : (

                            <>

                                <div className="resto-disponibilidad-msg is-error">

                                    <XCircle size={20} />

                                    <span>
                                        No hay disponibilidad para
                                        esta fecha y horario.
                                    </span>

                                </div>

                                <div className="resto-step-actions">

                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() =>
                                            setPaso(2)
                                        }
                                    >
                                        ← Elegir otra fecha
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() =>
                                            setPaso(3)
                                        }
                                    >
                                        Cambiar personas
                                    </button>

                                </div>

                            </>
                        )}

                    </div>
                )}

                {/* ==================================================
                    PASO 5 — RESERVA CONFIRMADA
                ================================================== */}

                {paso === 5 && reserva && (
                    <div className="resto-step-card resto-confirm-card">

                        <div className="resto-confirm-check">
                            <CheckCircle2 size={40} />
                        </div>

                        <h2 className="section-title font-display">
                            ¡Reserva confirmada!
                        </h2>

                        <div className="resto-confirm-summary">

                            <div className="resto-confirm-row">

                                <span className="info-label">
                                    Servicio
                                </span>

                                <p>
                                    {LABELS_SERVICIO[
                                        reserva.servicio?.nombre
                                    ] ||
                                        reserva.servicio?.nombre}

                                    {reserva.horario?.hora
                                        ? ` · ${reserva.horario.hora}`
                                        : ""}
                                </p>

                            </div>

                            <div className="resto-confirm-row">

                                <span className="info-label">
                                    Fecha
                                </span>

                                <p>
                                    {new Date(
                                        reserva.fecha
                                    ).toLocaleDateString(
                                        "es-AR",
                                        {
                                            timeZone: "UTC",
                                        }
                                    )}
                                </p>

                            </div>

                            <div className="resto-confirm-row">

                                <span className="info-label">
                                    Personas
                                </span>

                                <p>
                                    {reserva.personas}
                                </p>

                            </div>

                            <div className="resto-confirm-row">

                                <span className="info-label">
                                    Salón asignado
                                </span>

                                <p>
                                    {reserva.salon?.nombre}
                                </p>

                            </div>

                            <div className="resto-confirm-row">

                                <span className="info-label">
                                    N° de reserva
                                </span>

                                <p className="font-mono">
                                    {reserva.id
                                        .slice(0, 8)
                                        .toUpperCase()}
                                </p>

                            </div>

                        </div>

                        <Link
                            to="/resto"
                            className="btn-primary resto-confirm-btn"
                        >
                            <Home size={16} />
                            Volver a Restó
                        </Link>

                    </div>
                )}

            </section>

        </PublicLayout>
    );
}