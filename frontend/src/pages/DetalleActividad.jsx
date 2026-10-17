
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { api } from "../api/client";
import PublicLayout from "../components/PublicLayout";
import ActividadImagen from "../components/ActividadImagen";
import { CATS } from "../constants/categorias";
import { useToast } from "../context/ToastContext";

export default function DetalleActividad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [actividad, setActividad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const [success, setSuccess] = useState("");
  const [mostrarExito, setMostrarExito] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    habitacion: "",
    edad: "",
  });

  function cargar() {
    setCargando(true);

    api.obtenerActividad(undefined, id)
      .then((a) => {
        setActividad(a);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }

  useEffect(() => {
    cargar();
  }, [id]);

  function setField(campo) {
    return (e) => {
      setForm((actual) => ({
        ...actual,
        [campo]: e.target.value,
      }));

      setErroresCampos((actuales) => {
        if (!actuales[campo]) return actuales;

        const siguientes = { ...actuales };
        delete siguientes[campo];

        return siguientes;
      });
    };
  }

  function validarFormulario() {
    const errores = {};
    const habitacion = form.habitacion.trim();
    const edad = Number(form.edad);

    if (!form.nombre.trim()) {
      errores.nombre = "Ingresá tu nombre.";
    }

    if (!form.apellido.trim()) {
      errores.apellido = "Ingresá tu apellido.";
    }

    if (!habitacion) {
      errores.habitacion = "Ingresá el número de habitación.";
    } else if (!/^(?:\d+[A-Za-z]?|S[AB])$/i.test(habitacion)) {
      errores.habitacion =
        "Ingresá una habitación válida, por ejemplo 204.";
    }

    if (!form.edad) {
      errores.edad = "Ingresá tu edad.";
    } else if (!Number.isInteger(edad) || edad <= 0) {
      errores.edad = "Ingresá una edad válida.";
    }

    setErroresCampos(errores);

    return Object.keys(errores).length === 0;
  }

  async function handleInscribirse() {
    setError("");
    setSuccess("");

    if (!validarFormulario()) return;

    setProcesando(true);

    try {
      const resultado = await api.inscribirse({
        actividadId: id,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        habitacion: form.habitacion.trim(),
        edad: Number(form.edad),
      });

      const mensaje =
        resultado.estado === "CONFIRMADA"
          ? "Tu lugar en la actividad fue reservado correctamente."
          : "Tu lugar quedó registrado en lista de espera.";

      toast.success(mensaje, {
        title: "¡Reserva exitosa!",
      });

      setSuccess(
        resultado.estado === "CONFIRMADA"
          ? "Reserva confirmada"
          : "Quedaste en lista de espera"
      );

      setMostrarExito(true);

      setTimeout(() => {
        navigate("/recreacion");
      }, 2500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, {
        title: "Error en la reserva",
      });
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <PublicLayout>
        <div className="page-message" style={{ margin: "40px 0" }}>
          Cargando...
        </div>
      </PublicLayout>
    );
  }

  if (!actividad) {
    return (
      <PublicLayout>
        <div
          className="page-message page-error"
          style={{ margin: "40px 0" }}
        >
          Actividad no encontrada.
        </div>
      </PublicLayout>
    );
  }

  const cat = CATS[actividad.categoria] || CATS.ADULTOS;

  return (
    <PublicLayout>
      <section
        className="resto-reserva-section"
        style={{ paddingTop: 24 }}
      >
        <div
          className="page-surface"
          style={{ padding: "20px 20px 36px" }}
        >
          <button
            className="btn-ghost btn-inline"
            onClick={() => navigate("/recreacion")}
          >
            <ArrowLeft size={16} />
            Volver a recreación
          </button>

          {mostrarExito && (
            <div className="reserva-exito">
              <h1>✓</h1>

              <h2>Reserva realizada con éxito</h2>

              <p>{actividad.nombre}</p>

              <span>Volviendo a recreación...</span>
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-hero">
              <ActividadImagen
                actividad={actividad}
                size="lg"
                style={{
                  height: "100%",
                  borderRadius: 24,
                }}
              />
            </div>

            <div className="detail-panel">
              <div
                className="detail-label"
                style={{
                  background: cat.soft,
                  color: cat.color,
                }}
              >
                {cat.label.toUpperCase()} · {actividad.edadMinima}-
                {actividad.edadMaxima} años
              </div>

              <h1 className="detail-title font-display">
                {actividad.nombre}
              </h1>

              <p className="detail-copy">
                {actividad.descripcion}
              </p>

              <div className="detail-metrics">
                <div className="detail-metric">
                  <CalendarDays size={18} />

                  <div>
                    <span className="metric-label">Fecha</span>

                    <span>
                      {new Date(actividad.fecha).toLocaleDateString(
                        "es-AR"
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-metric">
                  <Clock3 size={18} />

                  <div>
                    <span className="metric-label">Horario</span>

                    <span>
                      {actividad.horaInicio} - {actividad.horaFin}
                    </span>
                  </div>
                </div>

                <div className="detail-metric">
                  <MapPin size={18} />

                  <div>
                    <span className="metric-label">Lugar</span>

                    <span>{actividad.lugar}</span>
                  </div>
                </div>

                <div className="detail-metric">
                  <Users size={18} />

                  <div>
                    <span className="metric-label">Cupos</span>

                    <span>
                      {actividad.cuposDisponibles}/
                      {actividad.cupoMaximo}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="field-error">{error}</div>
              )}

              <div className="detail-form">
                <div className="detail-form-heading">
                  <div
                    className="font-display"
                    style={{
                      color: "var(--paper)",
                      fontSize: 20,
                    }}
                  >
                    Reservá tu lugar
                  </div>

                  <div
                    className="font-mono"
                    style={{
                      color: "var(--paper)",
                      fontSize: 13,
                    }}
                  >
                    Completá tus datos para reservar tu lugar.
                  </div>
                </div>

                <div className="detail-form-grid">
                  <div className="form-field">
                    <label className="form-label" htmlFor="nombre">
                      Nombre
                    </label>

                    <input
                      id="nombre"
                      className="form-input"
                      value={form.nombre}
                      onChange={setField("nombre")}
                      aria-invalid={Boolean(erroresCampos.nombre)}
                      placeholder="Ej: Ana"
                    />

                    {erroresCampos.nombre && (
                      <span className="field-inline-error">
                        {erroresCampos.nombre}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="apellido">
                      Apellido
                    </label>

                    <input
                      id="apellido"
                      className="form-input"
                      value={form.apellido}
                      onChange={setField("apellido")}
                      aria-invalid={Boolean(erroresCampos.apellido)}
                      placeholder="Ej: Pérez"
                    />

                    {erroresCampos.apellido && (
                      <span className="field-inline-error">
                        {erroresCampos.apellido}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label
                      className="form-label"
                      htmlFor="habitacion"
                    >
                      Habitación
                    </label>

                    <input
                      id="habitacion"
                      className="form-input"
                      value={form.habitacion}
                      onChange={setField("habitacion")}
                      aria-invalid={Boolean(
                        erroresCampos.habitacion
                      )}
                      placeholder="Ej: 204"
                    />

                    {erroresCampos.habitacion && (
                      <span className="field-inline-error">
                        {erroresCampos.habitacion}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="edad">
                      Edad
                    </label>

                    <input
                      id="edad"
                      className="form-input"
                      type="number"
                      min="1"
                      value={form.edad}
                      onChange={setField("edad")}
                      aria-invalid={Boolean(erroresCampos.edad)}
                      placeholder="Ej: 28"
                    />

                    {erroresCampos.edad && (
                      <span className="field-inline-error">
                        {erroresCampos.edad}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  disabled={
                    procesando ||
                    actividad.estado === "CANCELADA" ||
                    actividad.estado === "FINALIZADA"
                  }
                  onClick={handleInscribirse}
                >
                  {procesando
                    ? "Procesando..."
                    : actividad.cuposDisponibles <= 0
                      ? "Anotarme en lista de espera"
                      : "Confirmar reserva"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
