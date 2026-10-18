import ActividadImagen from "./ActividadImagen";

const ESTADOS = {
  DISPONIBLE: { label: "Disponible", clase: "disponible" },
  CUPO_LLENO: { label: "Cupo lleno", clase: "cupo-lleno" },
  CANCELADA: { label: "Cancelada", clase: "cancelada" },
};

function estadoActividad(actividad) {
  if (actividad.estado === "CANCELADA") return "CANCELADA";
  if (actividad.cuposDisponibles <= 0 || actividad.estado === "CUPO_LLENO") return "CUPO_LLENO";
  return "DISPONIBLE";
}

export default function ActividadMiniCard({ actividad, onReservar }) {
  const cuposOcupados = actividad ? actividad.cupoMaximo - actividad.cuposDisponibles : 0;

  if (!actividad) {
    return (
      <div className="actividad-vacia">
        -
      </div>
    );
  }

  const estado = ESTADOS[estadoActividad(actividad)];

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
        <span className="actividad-mini-cupos">
          {cuposOcupados}/{actividad.cupoMaximo} cupos
        </span>
        <span className={`actividad-mini-estado ${estado.clase}`}>
          {estado.label}
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