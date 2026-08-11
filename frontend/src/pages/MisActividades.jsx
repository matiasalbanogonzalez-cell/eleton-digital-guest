import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BarraSuperior from "../components/BarraSuperior";
import ActividadImagen from "../components/ActividadImagen";
import { CATS } from "../constants/categorias";

export default function MisActividades() {
  const { token } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.misActividades(token).then(setInscripciones).finally(() => setCargando(false));
  }, [token]);

  return (
    <div className="app-frame">
      <BarraSuperior />
      <div className="page-surface" style={{ padding: "20px 20px 36px" }}>
        <div className="page-heading">
          <div>
            <div className="font-display" style={{ color: "var(--paper)", fontSize: 28, marginBottom: 8 }}>
              Tus inscripciones
            </div>
            <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.82, fontSize: 13, lineHeight: 1.6 }}>
              Seguimiento de tus actividades confirmadas y en lista de espera.
            </div>
          </div>
        </div>

        {cargando && <p className="page-message">Cargando...</p>}

        {!cargando && inscripciones.length === 0 && (
          <div className="page-empty">
            <div className="page-empty-title">No tenés actividades reservadas</div>
            <p className="page-empty-copy">Explorá las actividades disponibles y reservá tu próxima experiencia.</p>
          </div>
        )}

        <div className="activities-grid">
          {inscripciones.map((i) => {
            const a = i.actividad;
            const cat = CATS[a.categoria] || CATS.ADULTOS;
            return (
              <button
                key={i.id}
                className="activity-card"
                onClick={() => navigate(`/recreacion/actividades/${a.id}`)}
              >
                <div className="activity-card-media">
                  <ActividadImagen actividad={a} size="lg" />
                </div>
                <div className="activity-card-body">
                  <span className="activity-card-tag" style={{ background: cat.soft, color: cat.color }}>
                    {i.estado === "LISTA_ESPERA" ? "Lista de espera" : cat.label}
                  </span>
                  <div className="activity-card-title">{a.nombre}</div>
                  <div className="activity-card-copy">{a.lugar}</div>
                  <div className="activity-card-meta">
                    <span>{a.horaInicio} · {a.cuposDisponibles}/{a.cupoMaximo} cupos</span>
                    <span>{a.instructor ? `${a.instructor.nombre} ${a.instructor.apellido}` : "Instructor por definir"}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
