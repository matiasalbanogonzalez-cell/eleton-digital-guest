import { CATS } from "../constants/categorias";
import ActividadImagen from "./ActividadImagen";

export default function TicketActividad({ actividad, onClick }) {
  const cat = CATS[actividad.categoria] || CATS.ADULTOS;
  const lleno = actividad.cuposDisponibles <= 0;
  const estadoTexto =
    actividad.estado === "CANCELADA" ? "CANCELADA" : lleno ? "LLENO" : "ABIERTA";

  return (
    <div className="ticket" onClick={onClick}>
      <div className="ticket-main">
        <ActividadImagen actividad={actividad} size="sm" className="ticket-icon" />
        <div>
          <div className="ticket-nombre">{actividad.nombre}</div>
          <div className="ticket-meta">
            {actividad.lugar} · {actividad.instructor ? `${actividad.instructor.nombre} ${actividad.instructor.apellido}` : "Sin instructor"}
          </div>
          <div className="cat-badge" style={{ background: cat.soft, color: cat.color }}>
            {cat.label.toUpperCase()}
          </div>
        </div>
      </div>
      <div className="ticket-stub">
        <div className="hole" style={{ top: -5 }} />
        <div className="hole" style={{ bottom: -5 }} />
        <div className="stub-hora">{actividad.horaInicio}</div>
        <div className="stub-cupos">{actividad.cuposDisponibles}/{actividad.cupoMaximo} cupos</div>
        <div className={`stamp ${estadoTexto === "ABIERTA" ? "abierta" : ""}`}>{estadoTexto}</div>
      </div>
    </div>
  );
}
