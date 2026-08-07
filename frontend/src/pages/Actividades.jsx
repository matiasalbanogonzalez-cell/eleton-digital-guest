import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import AgendaRecreacion from "../components/AgendaRecreacion";

const DIAS = [
  {
    nombre: "Viernes",
    corto: "VI",
    fecha: "2026-08-07",
  },
  {
    nombre: "Sábado",
    corto: "SA",
    fecha: "2026-08-08",
  },
  {
    nombre: "Domingo",
    corto: "DO",
    fecha: "2026-08-09",
  },
  {
    nombre: "Lunes",
    corto: "LU",
    fecha: "2026-08-10",
  },
  {
    nombre: "Martes",
    corto: "MA",
    fecha: "2026-08-11",
  },
  {
    nombre: "Miércoles",
    corto: "MI",
    fecha: "2026-08-12",
  },
  {
    nombre: "Jueves",
    corto: "JU",
    fecha: "2026-08-13",
  },
];

export default function Actividades() {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    DIAS[0].fecha
  );

  const [actividades, setActividades] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    setCargando(true);
    setError("");

    api
      .listarActividades(
        token,
        diaSeleccionado,
        "TODAS"
      )
      .then(setActividades)
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setCargando(false);
      });

  }, [diaSeleccionado, token]);


 function abrirActividad(actividad) {
  navigate(`/recreacion/actividades/${actividad.id}`);
}


  const diaActual = DIAS.find(
    (dia) => dia.fecha === diaSeleccionado
  );


  const fechaLegible = diaActual
    ? `${diaActual.nombre} ${
        Number(diaActual.fecha.split("-")[2])
      } de Agosto`
    : "";


  return (

    <div
      className="page-surface"
      style={{
        padding: "22px 20px 36px",
      }}
    >

      <button
        type="button"
        className="btn-ghost"
        style={{
          marginBottom: 18
        }}
        onClick={() => navigate("/")}
      >
        ← Volver
      </button>


      <div className="page-title font-display">
        Recreación Eleton
      </div>


      <div className="page-subtitle font-mono">
        Agenda de actividades del resort
      </div>



      <div
        className="dias-selector"
        style={{
          display: "flex",
          gap: "8px",
          margin: "25px 0",
          flexWrap: "wrap",
        }}
      >

        {DIAS.map((dia) => (

          <button
            key={dia.fecha}
            className={
              diaSeleccionado === dia.fecha
                ? "nav-tab active"
                : "nav-tab"
            }
            onClick={() =>
              setDiaSeleccionado(dia.fecha)
            }
          >

            <strong>
              {dia.corto}
            </strong>

            <small>
              {dia.nombre}
            </small>

          </button>

        ))}

      </div>




      <h2 className="agenda-date">
        {fechaLegible}
      </h2>




      {cargando && (

        <p className="page-message">
          Cargando agenda...
        </p>

      )}




      {error && (

        <p className="page-message page-error">
          {error}
        </p>

      )}




      {!cargando && !error && (

        <AgendaRecreacion
          actividades={actividades}
          onReservar={abrirActividad}
        />

      )}


    </div>

  );

}