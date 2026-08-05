import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import ActividadImagen from "./ActividadImagen";
import { CATS } from "../constants/categorias";

export default function ActivityCard({ actividad, onClick }) {
  const cat = CATS[actividad.categoria] || CATS.ADULTOS;
  const lleno = actividad.cuposDisponibles <= 0;

  return (
    <button type="button" className="activity-card" onClick={onClick}>
      <div className="activity-card-media">
        <ActividadImagen actividad={actividad} size="lg" />
      </div>
      <div className="activity-card-body">
        <span className="activity-card-tag" style={{ background: cat.soft, color: cat.color }}>
          {cat.label}
        </span>
        <div className="activity-card-title">{actividad.nombre}</div>
        <div className="activity-card-copy">{actividad.lugar}</div>
        <div className="activity-card-meta">
          <span>
            <CalendarDays size={14} />
            {actividad.fecha ? ` ${new Date(actividad.fecha).toLocaleDateString("es-AR")}` : ""}
            {actividad.horaInicio ? ` · ${actividad.horaInicio}` : ""}
          </span>
          <span>
            <Users size={14} />
            {` ${actividad.cuposDisponibles} de ${actividad.cupoMaximo}`}
          </span>
        </div>
        <div className="activity-card-footer">
          <span>{lleno ? "Ver lista de espera" : "Ver actividad"}</span>
          <ArrowRight size={18} />
        </div>
      </div>
    </button>
  );
}
