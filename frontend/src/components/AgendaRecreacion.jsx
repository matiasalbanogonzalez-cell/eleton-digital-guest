import ActividadMiniCard from "./ActividadMiniCard";

const CATEGORIAS = ["KIDS", "ADOLESCENTES", "ADULTOS"];

export default function AgendaRecreacion({ actividades, onReservar, categoriasVisibles = CATEGORIAS }) {

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
    <div
      className="agenda-container"
      style={{ "--agenda-categorias": categoriasVisibles.length }}
    >


      <div className="agenda-header">

        <div>
          Hora
        </div>

        {categoriasVisibles.map((categoria) => (
          <div key={categoria}>
            {categoria === "KIDS" ? "Kids" : categoria === "ADOLESCENTES" ? "Adolescentes" : "Adultos"}
          </div>
        ))}

      </div>



      {horarios.map((hora) => (

        <div
          className="agenda-row"
          key={hora}
        >


          <div className="agenda-hora">
            {hora}
          </div>


          {categoriasVisibles.map((categoria) => (
            <ActividadMiniCard
              key={categoria}
              actividad={buscarActividad(hora, categoria)}
              onReservar={onReservar}
            />
          ))}


        </div>

      ))}


    </div>
  );
}