import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import ActividadImagen from "./ActividadImagen";
import { CATS } from "../constants/categorias";

export default function ActivityCard({ actividad, onClick }) {
  const cat = CATS[actividad.categoria] || CATS.ADULTOS;
  const lleno = actividad.cuposDisponibles <= 0;

  return (
    <button type="button" className="activity-card" onClick={onClick}>
      <div className="activity-card-media">
        <ActividadImagen actividad={actividad} size="lg" className="activity-card-img" />
        <div className="activity-card-scrim" />
        <span className="activity-card-tag" style={{ background: cat.color }}>
          {cat.label}
        </span>
        {lleno && <span className="activity-card-full">Sin cupo</span>}
        <div className="activity-card-title">{actividad.nombre}</div>
      </div>
      <div className="activity-card-body">
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
          <span>{lleno ? "Ver lista de espera" : "Inscribirme"}</span>
          <ArrowRight size={18} />
        </div>
      </div>
    </button>
  );
}