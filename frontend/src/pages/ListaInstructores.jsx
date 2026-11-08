import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BarraSuperior from "../components/BarraSuperior";

// Listado de instructores en solo lectura para el rol RECREADOR.
// Crear, modificar y desactivar son exclusivos del ADMIN: el servidor responde 403.
export default function ListaInstructores() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [instructores, setInstructores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  useEffect(() => {
    api.listarInstructoresAdmin(token)
      .then((data) => setInstructores(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token]);

  async function intentarModificar(inst) {
    try {
      await api.editarInstructorAdmin(token, inst.id, {
        nombre: inst.nombre,
        apellido: inst.apellido,
        email: inst.email || null,
        telefono: inst.telefono || null,
      });
      toast.success("Instructor actualizado.", { title: "Instructor" });
    } catch (err) {
      toast.error(`Error ${err.status ?? ""}: ${err.message}`.replace("Error : ", "Error: "), {
        title: "No se pudo modificar el instructor",
      });
    }
  }

  const totalActivos = instructores.filter((i) => i.activo).length;
  const totalInactivos = instructores.length - totalActivos;

  const filtrados = instructores.filter((i) => {
    const coincideEstado =
      filtroEstado === "TODOS" || (filtroEstado === "ACTIVOS" ? i.activo : !i.activo);
    const texto = `${i.nombre} ${i.apellido} ${i.email || ""}`.toLowerCase();
    return coincideEstado && texto.includes(busqueda.toLowerCase());
  });

  const cajaResumen = { background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" };

  return (
    <div className="app-frame">
      <BarraSuperior />

      <div style={{ padding: "10px 18px 32px" }}>
        <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>
            Instructores
          </div>
          <div
            className="font-mono"
            style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em", marginTop: 4 }}
          >
            CONSULTA · SOLO LECTURA
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={cajaResumen}>
            <div className="font-mono" style={{ color: "var(--paper-2)", fontSize: 9, opacity: 0.65 }}>TOTAL</div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{instructores.length}</div>
          </div>
          <div style={cajaResumen}>
            <div className="font-mono" style={{ color: "#2ECC71", fontSize: 9, fontWeight: 700 }}>ACTIVOS</div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{totalActivos}</div>
          </div>
          <div style={cajaResumen}>
            <div className="font-mono" style={{ color: "#E74C3C", fontSize: 9, fontWeight: 700 }}>INACTIVOS</div>
            <div style={{ color: "var(--paper)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{totalInactivos}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input
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
            {[["TODOS", "Todos"], ["ACTIVOS", "Activos"], ["INACTIVOS", "Inactivos"]].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                className="btn-ghost"
                style={{
                  padding: "6px 12px",
                  fontSize: 10.5,
                  background: filtroEstado === valor ? "rgba(255,255,255,0.14)" : "transparent",
                }}
                onClick={() => setFiltroEstado(valor)}
              >
                {texto}
              </button>
            ))}
          </div>
        </div>

        {cargando && <p style={{ color: "var(--paper-2)", fontSize: 12 }}>Cargando instructores...</p>}
        {error && <div style={{ color: "#E74C3C", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        {!cargando && !error && filtrados.length === 0 && (
          <p style={{ color: "var(--paper-2)", fontSize: 12 }}>Sin resultados.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtrados.map((inst) => {
            const iniciales = `${inst.nombre?.[0] || ""}${inst.apellido?.[0] || ""}`.toUpperCase();
            return (
              <div
                key={inst.id}
                style={{
                  background: "var(--paper)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  opacity: inst.activo ? 1 : 0.82,
                  borderLeft: inst.activo ? "4px solid #2ECC71" : "4px solid #E74C3C",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              >
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
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        border: "2px solid var(--gold)",
                      }}
                    >
                      {iniciales || "IN"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.2 }}>
                        {inst.nombre} {inst.apellido}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2, wordBreak: "break-all" }}>
                        {inst.email || "Sin correo"}
                      </div>
                    </div>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      background: inst.activo ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                      color: inst.activo ? "#1F7A4D" : "#B23A2E",
                      border: `1px solid ${inst.activo ? "#1F7A4D" : "#B23A2E"}`,
                    }}
                  >
                    {inst.activo ? "● ACTIVO" : "○ INACTIVO"}
                  </span>
                </div>

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
                    <div><span style={{ fontWeight: 600 }}>Tel:</span> {inst.telefono}</div>
                  )}
                  <div>
                    <span style={{ fontWeight: 600 }}>Actividades asignadas:</span>{" "}
                    <strong style={{ color: "var(--text)" }}>
                      {inst.actividadesAsignadas ?? inst.totalActividades ?? 0}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{
                      padding: "6px 12px",
                      fontSize: 11,
                      color: "var(--text)",
                      borderColor: "rgba(18,56,50,0.25)",
                    }}
                    onClick={() => intentarModificar(inst)}
                  >
                    ✏ Modificar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
