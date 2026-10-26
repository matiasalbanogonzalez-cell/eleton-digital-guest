import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { token } = useAuth();
  const [fecha, setFecha] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    setCargando(true);
    api
      .dashboardAdmin(token, fecha)
      .then(setResumen)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token, fecha]);

  useEffect(cargar, [cargar]);

  const cardStyle = { background: "var(--paper)", borderRadius: 14, padding: "16px 18px" };
  const linkStyle = { padding: "8px 14px", fontSize: 11, borderRadius: 10 };

  return (
    <div className="app-frame">
      <div style={{ padding: "16px 18px 10px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 24, lineHeight: 1 }}>Eleton Admin</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              DASHBOARD GENERAL
            </div>
          </div>
          <Link to="/" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10.5 }}>← Inicio</Link>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Link to="/admin/reservas" className="btn-ghost" style={linkStyle}>Todas las reservas</Link>
          <Link to="/admin/avisos" className="btn-ghost" style={linkStyle}>Avisos</Link>
          <Link to="/admin/instructores" className="btn-ghost" style={linkStyle}>Instructores</Link>
          <Link to="/resto/panel" className="btn-ghost" style={linkStyle}>Panel Restó</Link>
          <Link to="/spa/panel" className="btn-ghost" style={linkStyle}>Panel Spa</Link>
          <Link to="/teatro/panel" className="btn-ghost" style={linkStyle}>Panel Teatro</Link>
          <Link to="/recreacion/panel" className="btn-ghost" style={linkStyle}>Panel Recreación</Link>
        </div>

        <div className="form-field">
          <label className="form-label">Fecha</label>
          <input className="form-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        {cargando && <p style={{ color: "var(--paper-2)", opacity: 0.7 }}>Cargando...</p>}

        {!cargando && resumen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={cardStyle}>
              <div className="info-label">Restó</div>
              <div className="info-value">{resumen.resto.reservas} reservas · {resumen.resto.personas} personas</div>
            </div>
            <div style={cardStyle}>
              <div className="info-label">Recreación</div>
              <div className="info-value">
                {resumen.recreacion.inscriptos} inscriptos
                {resumen.recreacion.instructores !== undefined ? ` · ${resumen.recreacion.instructores} instructores` : ""}
              </div>
            </div>
            <div style={cardStyle}>
              <div className="info-label">Spa</div>
              <div className="info-value">{resumen.spa.reservas} reservas · {resumen.spa.personas} personas</div>
            </div>
            <div style={cardStyle}>
              <div className="info-label">Teatro</div>
              <div className="info-value">{resumen.teatro.reservas} reservas · {resumen.teatro.personas} personas</div>
            </div>
            <div style={cardStyle}>
              <div className="info-label">Avisos activos ahora</div>
              <div className="info-value">{resumen.avisosActivos}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
