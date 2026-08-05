import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BarraSuperior from "../components/BarraSuperior";
import ActivityCard from "../components/ActivityCard";

const FILTROS = ["TODAS", "KIDS", "ADOLESCENTES", "ADULTOS"];

export default function Actividades() {
  const { token } = useAuth();
  const [filtro, setFiltro] = useState("TODAS");
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    setError("");
    api
      .listarActividades(undefined, filtro)
      .then(setActividades)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [filtro]);

  return (
    <div className="app-frame">
      <BarraSuperior />
      <div className="page-surface" style={{ padding: "22px 20px 36px" }}>
        <div className="page-heading">
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 28, marginBottom: 8 }}>
              Agenda de recreación
            </div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.8, fontSize: 13, lineHeight: 1.6 }}>
              Reservá tu lugar en las experiencias del resort y viví cada momento con calma.
            </div>
          </div>
        </div>

        <div className="filter-pill-row" style={{ margin: "20px 0 18px" }}>
          {FILTROS.map((f) => (
            <button
              key={f}
              className={`nav-tab ${filtro === f ? "active" : ""}`}
              onClick={() => setFiltro(f)}
            >
              {f === "TODAS" ? "Todas" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {cargando && <p className="page-message">Cargando actividades...</p>}
        {error && <p className="page-message page-error">{error}</p>}
        {!cargando && actividades.length === 0 && (
          <div className="page-empty">
            <div className="page-empty-title">No hay actividades en esta categoría.</div>
            <p className="page-empty-copy">Probá con otra categoría o volvé más tarde para ver la agenda disponible.</p>
          </div>
        )}

        <div className="activities-grid">
          {actividades.map((a) => (
            <ActivityCard key={a.id} actividad={a} onClick={() => navigate(`/recreacion/actividades/${a.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
