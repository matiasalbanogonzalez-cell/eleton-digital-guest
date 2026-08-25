import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const AREA_LABEL = { resto: "Restó", recreacion: "Recreación", spa: "Spa", teatro: "Teatro" };
const AREA_COLOR = {
  resto: { solid: "#B8862F", soft: "#F2E6CC" },
  recreacion: { solid: "#C97C4D", soft: "#F5E1D3" },
  spa: { solid: "#4F7A6C", soft: "#DCEAE5" },
  teatro: { solid: "#7A3B36", soft: "#EEDAD8" },
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TodasLasReservas() {
  const { token } = useAuth();
  const [fecha, setFecha] = useState(hoyISO());
  const [area, setArea] = useState("");
  const [estado, setEstado] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    setCargando(true);
    api
      .todasLasReservas(token, { fecha, area, estado, habitacion })
      .then(setReservas)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token, fecha, area, estado, habitacion]);

  useEffect(cargar, [cargar]);

  const cardStyle = { background: "var(--paper)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 };

  return (
    <div className="app-frame">
      <div style={{ padding: "16px 18px 10px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>Todas las reservas</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              VISTA CONSOLIDADA
            </div>
          </div>
          <Link to="/admin/dashboard" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>← Dashboard</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Área</label>
            <select className="form-select" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas</option>
              <option value="resto">Restó</option>
              <option value="recreacion">Recreación</option>
              <option value="spa">Spa</option>
              <option value="teatro">Teatro</option>
            </select>
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Estado</label>
            <input className="form-input" placeholder="CONFIRMADA..." value={estado} onChange={(e) => setEstado(e.target.value)} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label className="form-label">Habitación</label>
            <input className="form-input" placeholder="204..." value={habitacion} onChange={(e) => setHabitacion(e.target.value)} />
          </div>
        </div>

        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && reservas.length === 0 && (
          <p style={{ color: "var(--paper-2)", opacity: 0.6, fontSize: 12.5 }}>No hay reservas para este filtro.</p>
        )}

        {!cargando &&
          reservas.map((r) => {
            const color = AREA_COLOR[r.area] || { solid: "var(--gold)", soft: "var(--paper-2)" };
            return (
              <div key={`${r.area}-${r.idOriginal}`} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.huesped}</div>
                    <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                      Hab. {r.habitacion} · {r.servicio}{r.horario ? ` (${r.horario})` : ""} · {r.personas} pers.
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-soft)" }}>
                      {new Date(r.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })}
                    </div>
                  </div>
                  <span
                    className="font-mono"
                    style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: color.soft, color: color.solid }}
                  >
                    {AREA_LABEL[r.area]}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
