import ActividadImagen from "./ActividadImagen";

export default function ActividadMiniCard({ actividad, onReservar }) {

  if (!actividad) {
    return (
      <div className="actividad-vacia">
        -
      </div>
    );
  }

  return (
    <div className="actividad-mini-card">

      <ActividadImagen
        actividad={actividad}
        size="sm"
        className="actividad-mini-img"
      />

      <div className="actividad-mini-info">

        <strong>
          {actividad.nombre}
        </strong>

        <span>
          {actividad.horaInicio}
        </span>

        <button
          onClick={() => onReservar(actividad)}
          className="btn-reservar"
        >
          Reservar
        </button>

      </div>

    </div>
  );
}