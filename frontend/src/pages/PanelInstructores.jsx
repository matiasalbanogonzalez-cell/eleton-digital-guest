import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function PanelInstructores() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [instructores, setInstructores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Búsqueda y filtrado
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // "TODOS", "ACTIVOS", "INACTIVOS"

  // Formulario alta / modificación
  const [mostrarForm, setMostrarForm] = useState(false);
  const [instructorEditando, setInstructorEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    activo: true,
  });

  // Modal confirmación de baja definitiva
  const [instructorAEliminar, setInstructorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarInstructores = useCallback(() => {
    setCargando(true);
    setError("");
    api
      .listarInstructoresAdmin(token)
      .then((data) => setInstructores(data || []))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message, { title: "Error al cargar" });
      })
      .finally(() => setCargando(false));
  }, [token, toast]);

  useEffect(() => {
    cargarInstructores();
  }, [cargarInstructores]);

  function abrirNuevo() {
    setInstructorEditando(null);
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      activo: true,
    });
    setError("");
    setMostrarForm(true);
  }

  function abrirEditar(inst) {
    setInstructorEditando(inst);
    setForm({
      nombre: inst.nombre || "",
      apellido: inst.apellido || "",
      email: inst.email || "",
      telefono: inst.telefono || "",
      activo: inst.activo ?? true,
    });
    setError("");
    setMostrarForm(true);
  }

  function cerrarFormulario() {
    setMostrarForm(false);
    setInstructorEditando(null);
  }

  async function guardarInstructor(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      if (!form.nombre.trim() || !form.apellido.trim()) {
        throw new Error("El nombre y apellido del instructor son obligatorios.");
      }

      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email?.trim() || null,
        telefono: form.telefono?.trim() || null,
        activo: form.activo,
      };

      if (instructorEditando) {
        // Modificar
        const actualizado = await api.editarInstructorAdmin(token, instructorEditando.id, payload);
        toast.success(`Datos de ${actualizado.nombre} ${actualizado.apellido} actualizados.`, {
          title: "Instructor modificado",
        });
      } else {
        // Dar de alta
        const nuevo = await api.crearInstructorAdmin(token, payload);
        toast.success(`Instructor ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente.`, {
          title: "Alta de instructor",
        });
      }

      cerrarFormulario();
      cargarInstructores();
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { title: "No se pudo guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function toggleEstado(inst) {
    try {
      const res = await api.toggleActivoInstructorAdmin(token, inst.id);
      toast.info(res.mensaje, { title: "Estado actualizado" });
      setInstructores((prev) =>
        prev.map((i) => (i.id === inst.id ? { ...i, activo: res.activo } : i))
      );
    } catch (err) {
      toast.error(err.message, { title: "Error" });
    }
  }

  async function confirmarEliminacion() {
    if (!instructorAEliminar) return;
    setEliminando(true);

    try {
      const res = await api.eliminarInstructorAdmin(token, instructorAEliminar.id);
      toast.success(res.mensaje, { title: "Instructor eliminado" });
      setInstructorAEliminar(null);
      cargarInstructores();
    } catch (err) {
      toast.error(err.message, { title: "No se pudo eliminar" });
    } finally {
      setEliminando(false);
    }
  }

  // Filtrado
  const instructoresFiltrados = useMemo(() => {
    return instructores.filter((inst) => {
      const coincideBusqueda =
        busqueda.trim() === "" ||
        `${inst.nombre} ${inst.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        inst.email.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstado =
        filtroEstado === "TODOS" ||
        (filtroEstado === "ACTIVOS" && inst.activo) ||
        (filtroEstado === "INACTIVOS" && !inst.activo);

      return coincideBusqueda && coincideEstado;
    });
  }, [instructores, busqueda, filtroEstado]);

  const totalActivos = instructores.filter((i) => i.activo).length;
  const totalInactivos = instructores.length - totalActivos;

  const cardStyle = { background: "var(--paper)", borderRadius: 14, padding: "16px 18px" };
  const linkStyle = { padding: "8px 14px", fontSize: 11, borderRadius: 10, textDecoration: "none" };

  return (
    <div className="app-frame">
      <div style={{ padding: "16px 18px 24px 18px" }}>
        {/* =========================
            HEADER
        ========================= */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>
              Instructores
            </div>
            <div
              className="font-mono"
              style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em", marginTop: 4 }}
            >
              ADMINISTRACIÓN DE RECREACIÓN
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/recreacion/panel" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>
              Panel Recreación →
            </Link>
            <Link to="/admin/dashboard" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* =========================
            ACCESOS RÁPIDOS ADMIN
        ========================= */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Link to="/admin/dashboard" className="btn-ghost" style={linkStyle}>
            Dashboard
          </Link>
          <Link to="/admin/reservas" className="btn-ghost" style={linkStyle}>
            Todas las reservas
          </Link>
          <Link to="/admin/avisos" className="btn-ghost" style={linkStyle}>
            Avisos
          </Link>
          <Link
            to="/admin/instructores"
            className="btn-ghost"
            style={{ ...linkStyle, background: "rgba(216,164,57,0.2)", borderColor: "var(--gold)" }}
          >
            Instructores
          </Link>
          <Link to="/recreacion/panel" className="btn-ghost" style={linkStyle}>
            Panel Recreación
          </Link>
        </div>

        {/* =========================
            RESUMEN DE METRICAS
        ========================= */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <div className="font-mono" style={{ color: "var(--paper-2)", fontSize: 9, opacity: 0.65 }}>
              TOTAL
            </div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>
              {instructores.length}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <div className="font-mono" style={{ color: "#2ECC71", fontSize: 9, fontWeight: 700 }}>
              ACTIVOS
            </div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>
              {totalActivos}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <div className="font-mono" style={{ color: "#E74C3C", fontSize: 9, fontWeight: 700 }}>
              INACTIVOS
            </div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>
              {totalInactivos}
            </div>
          </div>
        </div>

        {/* BOTÓN ALTA */}
        <button
          className="btn-primary"
          style={{ width: "100%", marginBottom: 14 }}
          onClick={() => {
            if (mostrarForm) cerrarFormulario();
            else abrirNuevo();
          }}
        >
          {mostrarForm ? "✕ Cerrar formulario" : "+ Nuevo instructor"}
        </button>

        {/* =========================
            FORMULARIO ALTA / EDICIÓN
        ========================= */}
        {mostrarForm && (
          <form
            onSubmit={guardarInstructor}
            className="panel-form"
            style={{
              background: "var(--paper)",
              borderRadius: 14,
              padding: "18px 16px",
              marginBottom: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="font-display"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{instructorEditando ? "Modificar instructor" : "Dar de alta instructor"}</span>
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  background: "rgba(216,164,57,0.2)",
                  color: "var(--ink)",
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                ROL: RECREADOR
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "#FBDCD1",
                  border: "1px solid #E8664B",
                  color: "#B23A2E",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-field" style={{ margin: "0 0 12px 0" }}>
                <label className="form-label">Nombre *</label>
                <input
                  className="form-input"
                  required
                  placeholder="Ej. Juan"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div className="form-field" style={{ margin: "0 0 12px 0" }}>
                <label className="form-label">Apellido *</label>
                <input
                  className="form-input"
                  required
                  placeholder="Ej. Pérez"
                  value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div className="form-field" style={{ margin: 0 }}>
                <label className="form-label">Correo electrónico (opcional)</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="instructor@eleton.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-field" style={{ margin: 0 }}>
                <label className="form-label">Teléfono (opcional)</label>
                <input
                  className="form-input"
                  placeholder="+54 3541..."
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field" style={{ margin: "0 0 14px 0" }}>
              <label className="form-label">Estado del instructor</label>
              <select
                className="form-select"
                value={form.activo ? "true" : "false"}
                onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}
              >
                <option value="true">Activo (Disponible para asignar actividades)</option>
                <option value="false">Desactivado (Baja lógica)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: "10px 18px", color: "var(--text)" }}
                onClick={cerrarFormulario}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={guardando}
                style={{ padding: "10px 20px" }}
              >
                {guardando ? "Guardando..." : instructorEditando ? "Guardar cambios" : "Crear instructor"}
              </button>
            </div>
          </form>
        )}

        {/* =========================
            BARRA DE BÚSQUEDA Y FILTROS
        ========================= */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            className="form-input"
            style={{
              flex: 1,
              minWidth: 160,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--paper)",
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 10,
            }}
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 10.5,
                background: filtroEstado === "TODOS" ? "rgba(255,255,255,0.14)" : "transparent",
              }}
              onClick={() => setFiltroEstado("TODOS")}
            >
              Todos ({instructores.length})
            </button>
            <button
              className="btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 10.5,
                background: filtroEstado === "ACTIVOS" ? "rgba(46,204,113,0.2)" : "transparent",
                borderColor: filtroEstado === "ACTIVOS" ? "#2ECC71" : undefined,
              }}
              onClick={() => setFiltroEstado("ACTIVOS")}
            >
              Activos ({totalActivos})
            </button>
            <button
              className="btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 10.5,
                background: filtroEstado === "INACTIVOS" ? "rgba(231,76,60,0.2)" : "transparent",
                borderColor: filtroEstado === "INACTIVOS" ? "#E74C3C" : undefined,
              }}
              onClick={() => setFiltroEstado("INACTIVOS")}
            >
              Inactivos ({totalInactivos})
            </button>
          </div>
        </div>

        {/* =========================
            LISTADO DE INSTRUCTORES
        ========================= */}
        {cargando && (
          <p style={{ color: "var(--paper-2)", opacity: 0.7, textAlign: "center", padding: "20px 0" }}>
            Cargando instructores de recreación...
          </p>
        )}

        {!cargando && instructoresFiltrados.length === 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: "28px 18px",
              textAlign: "center",
              color: "var(--paper-2)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--paper)" }}>
              No se encontraron instructores
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {busqueda ? "Probá con otro término de búsqueda." : "Comenzá dando de alta un nuevo instructor."}
            </div>
          </div>
        )}

        {!cargando && instructoresFiltrados.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {instructoresFiltrados.map((inst) => {
              const iniciales = `${inst.nombre?.[0] || ""}${inst.apellido?.[0] || ""}`.toUpperCase();

              return (
                <div
                  key={inst.id}
                  className="panel-card"
                  style={{
                    ...cardStyle,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    opacity: inst.activo ? 1 : 0.82,
                    borderLeft: inst.activo ? "4px solid #2ECC71" : "4px solid #E74C3C",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Fila superior: avatar, datos y badge estado */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: inst.activo ? "var(--ink)" : "#7F8C8D",
                          color: "var(--paper)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                          border: "2px solid var(--gold)",
                        }}
                      >
                        {iniciales || "IN"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "var(--text)",
                            lineHeight: 1.2,
                          }}
                        >
                          {inst.nombre} {inst.apellido}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-soft)",
                            marginTop: 2,
                            wordBreak: "break-all",
                          }}
                        >
                          {inst.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          letterSpacing: "0.04em",
                          background: inst.activo ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                          color: inst.activo ? "#1F7A4D" : "#B23A2E",
                          border: `1px solid ${inst.activo ? "#1F7A4D" : "#B23A2E"}`,
                        }}
                      >
                        {inst.activo ? "● ACTIVO" : "○ INACTIVO"}
                      </span>
                    </div>
                  </div>

                  {/* Fila intermedia: metadatos */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 14,
                      fontSize: 11,
                      color: "var(--text-soft)",
                      paddingTop: 4,
                      borderTop: "1px solid rgba(18,56,50,0.08)",
                    }}
                  >
                    {inst.telefono && (
                      <div>
                        <span style={{ fontWeight: 600 }}>Tel:</span> {inst.telefono}
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: 600 }}>Actividades asignadas:</span>{" "}
                      <strong style={{ color: "var(--text)" }}>{inst.actividadesAsignadas ?? inst.totalActividades ?? 0}</strong>
                    </div>
                  </div>

                  {/* Fila inferior: acciones (Modificar, Desactivar/Activar, Eliminar) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 8,
                      flexWrap: "wrap",
                      paddingTop: 6,
                    }}
                  >
                    <button
                      className="btn-ghost"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "var(--text)",
                        borderColor: "rgba(18,56,50,0.25)",
                      }}
                      onClick={() => abrirEditar(inst)}
                    >
                      ✏ Modificar
                    </button>

                    <button
                      className="btn-ghost"
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        color: inst.activo ? "#B23A2E" : "#1F7A4D",
                        borderColor: inst.activo ? "rgba(178,58,46,0.35)" : "rgba(31,122,77,0.35)",
                      }}
                      onClick={() => toggleEstado(inst)}
                    >
                      {inst.activo ? "Desactivar" : "Activar"}
                    </button>

                    {(inst.actividadesAsignadas ?? 0) > 0 ? (
                      <button
                        className="btn-ghost"
                        disabled
                        title={`Tiene ${inst.actividadesAsignadas} actividad(es) asignada(s). Para preservar el histórico, utilizá "Desactivar" (baja lógica).`}
                        style={{
                          padding: "6px 12px",
                          fontSize: 11,
                          color: "#999",
                          borderColor: "rgba(0,0,0,0.12)",
                          cursor: "not-allowed",
                          opacity: 0.5,
                        }}
                      >
                        🗑 Eliminar
                      </button>
                    ) : (
                      <button
                        className="btn-ghost"
                        style={{
                          padding: "6px 12px",
                          fontSize: 11,
                          color: "#B23A2E",
                          borderColor: "rgba(178,58,46,0.25)",
                        }}
                        onClick={() => setInstructorAEliminar(inst)}
                      >
                        🗑 Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          MODAL CONFIRMACIÓN DE ELIMINACIÓN
      ========================= */}
      {instructorAEliminar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 18,
          }}
        >
          <div
            style={{
              background: "var(--paper)",
              borderRadius: 16,
              maxWidth: 420,
              width: "100%",
              padding: 20,
              boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
              color: "var(--text)",
            }}
          >
            <div
              className="font-display"
              style={{ fontSize: 18, color: "#B23A2E", marginBottom: 8, fontWeight: 700 }}
            >
              ¿Eliminar instructor?
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text)", marginBottom: 12 }}>
              Estás a punto de dar de baja definitiva a{" "}
              <strong>
                {instructorAEliminar.nombre} {instructorAEliminar.apellido}
              </strong>{" "}
              (<code>{instructorAEliminar.email}</code>).
            </div>

            <div
              style={{
                background: "rgba(232,102,75,0.12)",
                border: "1px solid rgba(232,102,75,0.3)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 11.5,
                lineHeight: 1.45,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              <strong>Baja de instructor:</strong> Este instructor no posee actividades asignadas en la agenda, por lo que su registro puede ser eliminado de forma segura. Si preferís conservarlo en la nómina histórica del hotel, podés cancelar y optar por <strong>Desactivarlo</strong> (baja lógica).
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: "8px 14px", color: "var(--text)", borderColor: "rgba(18,56,50,0.25)" }}
                onClick={() => setInstructorAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "none",
                }}
                onClick={confirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
