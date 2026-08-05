import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BarraSuperior() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const esRecreador = usuario?.rol === "RECREADOR" || usuario?.rol === "ADMIN";

  return (
    <div style={{ padding: "16px 18px 10px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--gold)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)",
              fontFamily: "'Bebas Neue'", fontSize: 16,
            }}
          >
            RE
          </div>
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 20, lineHeight: 1 }}>ELETON</div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.55, fontSize: 9, letterSpacing: "0.05em" }}>
              RECREACIÓN
            </div>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--paper-2)", opacity: 0.7 }}>
            {usuario?.nombre}
          </span>
          <button
            className="btn-ghost"
            style={{ padding: "6px 12px", fontSize: 10.5 }}
            onClick={cerrarSesion}
          >
            Salir
          </button>
        </div>
      </div>

      {usuario && (
        <div className="nav-tabs" style={{ display: "flex", gap: 8, paddingTop: 14, overflowX: "auto" }}>
          {!esRecreador && (
            <>
              <Link to="/recreacion" className={`nav-tab ${location.pathname === "/recreacion" ? "active" : ""}`}>
                Actividades
              </Link>
              <Link to="/recreacion/mis-actividades" className={`nav-tab ${location.pathname === "/recreacion/mis-actividades" ? "active" : ""}`}>
                Mis actividades
              </Link>
            </>
          )}
          {esRecreador && (
            <>
              <Link to="/recreacion/panel" className={`nav-tab ${location.pathname === "/recreacion/panel" ? "active" : ""}`}>
                Panel recreador
              </Link>
              <Link to="/recreacion" className={`nav-tab ${location.pathname === "/recreacion" ? "active" : ""}`}>
                Ver como huésped
              </Link>
            </>
          )}
          <Link to="/" className="nav-tab">
            ← Inicio Eleton
          </Link>
        </div>
      )}
    </div>
  );
}
