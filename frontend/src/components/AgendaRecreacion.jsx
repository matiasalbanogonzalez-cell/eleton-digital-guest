import ActividadMiniCard from "./ActividadMiniCard";

export default function AgendaRecreacion({ actividades, onReservar }) {

  const horarios = [
    ...new Set(
      actividades.map((actividad) => actividad.horaInicio)
    ),
  ].sort();


  function buscarActividad(hora, categoria) {
    return actividades.find(
      (actividad) =>
        actividad.horaInicio === hora &&
        actividad.categoria === categoria
    );
  }


  if (actividades.length === 0) {
    return (
      <div className="agenda-vacia">
        <p>No hay actividades para este día.</p>
        <span>
          Consultá otro día de la semana para ver la agenda disponible.
        </span>
      </div>
    );
  }


  return (
    <div className="agenda-container">


      <div className="agenda-header">

        <div>
          Hora
        </div>

        <div>
          Kids
        </div>

        <div>
          Teens
        </div>

        <div>
          Adultos
        </div>

      </div>



      {horarios.map((hora) => (

        <div
          className="agenda-row"
          key={hora}
        >


          <div className="agenda-hora">
            {hora}
          </div>


          <ActividadMiniCard
            actividad={buscarActividad(hora, "KIDS")}
            onReservar={onReservar}
          />


          <ActividadMiniCard
            actividad={buscarActividad(hora, "ADOLESCENTES")}
            onReservar={onReservar}
          />


          <ActividadMiniCard
            actividad={buscarActividad(hora, "ADULTOS")}
            onReservar={onReservar}
          />


        </div>

      ))}


    </div>
  );
}