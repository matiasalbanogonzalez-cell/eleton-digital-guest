import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { api } from "../api/client";
import ActividadImagen from "../components/ActividadImagen";
import { CATS } from "../constants/categorias";

export default function DetalleActividad() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mostrarExito, setMostrarExito] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    habitacion: "",
    edad: ""
  });


  function cargar() {

    setCargando(true);

    api.obtenerActividad(undefined, id)

      .then((a) => {
        setActividad(a);
      })

      .catch((err) => {
        setError(err.message);
      })

      .finally(() => {
        setCargando(false);
      });

  }



  useEffect(() => {

    cargar();

  }, [id]);




  function setField(campo) {

    return (e) => {

      setForm({
        ...form,
        [campo]: e.target.value
      });

    };

  }




  async function handleInscribirse() {

    setProcesando(true);
    setError("");
    setSuccess("");


    try {


      const resultado = await api.inscribirse({

        actividadId: id,

        nombre: form.nombre.trim(),

        habitacion: form.habitacion.trim(),

        edad: Number(form.edad),

      });



      setSuccess(
        resultado.estado === "CONFIRMADA"
          ? "Reserva confirmada"
          : "Quedaste en lista de espera"
      );


      setMostrarExito(true);



      setTimeout(() => {

        navigate("/recreacion");

      }, 2500);



    } catch (err) {

      setError(err.message);

    } finally {

      setProcesando(false);

    }

  }





  if (cargando) {

    return (

      <div className="page-message">

        Cargando...

      </div>

    );

  }



  if (!actividad) {

    return (

      <div className="page-message">

        Actividad no encontrada.

      </div>

    );

  }




  const cat = CATS[actividad.categoria] || CATS.ADULTOS;



  return (

    <div 
      className="page-surface"
      style={{
        padding:"20px 20px 36px"
      }}
    >


      <button

        className="btn-ghost btn-inline"

        onClick={() => navigate("/recreacion")}

      >

        <ArrowLeft size={16}/>

        Volver a recreación

      </button>




      {mostrarExito && (

        <div className="reserva-exito">

          <h1>
            ✓
          </h1>

          <h2>
            Reserva realizada con éxito
          </h2>


          <p>
            {actividad.nombre}
          </p>


          <span>
            Volviendo a recreación...
          </span>


        </div>

      )}





      <div className="detail-grid">


        <div className="detail-hero">


          <ActividadImagen

            actividad={actividad}

            size="lg"

            style={{
              height:"100%",
              borderRadius:24
            }}

          />


        </div>






        <div className="detail-panel">



          <div

            className="detail-label"

            style={{
              background:cat.soft,
              color:cat.color
            }}

          >

            {cat.label.toUpperCase()} · {actividad.edadMinima}-{actividad.edadMaxima} años


          </div>





          <h1 className="detail-title font-display">

            {actividad.nombre}

          </h1>





          <p className="detail-copy">

            {actividad.descripcion}

          </p>






          <div className="detail-metrics">



            <div className="detail-metric">

              <CalendarDays size={18}/>

              <div>

                <span className="metric-label">
                  Fecha
                </span>

                <span>
                  {new Date(actividad.fecha).toLocaleDateString("es-AR")}
                </span>


              </div>

            </div>






            <div className="detail-metric">


              <Clock3 size={18}/>


              <div>

                <span className="metric-label">
                  Horario
                </span>


                <span>

                  {actividad.horaInicio} - {actividad.horaFin}

                </span>


              </div>


            </div>






            <div className="detail-metric">


              <MapPin size={18}/>


              <div>


                <span className="metric-label">
                  Lugar
                </span>


                <span>
                  {actividad.lugar}
                </span>


              </div>


            </div>







            <div className="detail-metric">


              <Users size={18}/>


              <div>


                <span className="metric-label">
                  Cupos
                </span>


                <span>

                  {actividad.cuposDisponibles}/{actividad.cupoMaximo}

                </span>


              </div>


            </div>



          </div>






          {error && (

            <div className="field-error">

              {error}

            </div>

          )}






          <div className="detail-form">


            <div className="detail-form-heading">


              <div 
                className="font-display"
                style={{
                  color: "var(--paper)",
                  fontSize:20
                }}
              >

                Reserva tu lugar

              </div>



              <div

                className="font-mono"

                style={{
                  color:"var(--paper)",
                  fontSize:13
                }}

              >

                Completá tus datos para reservar tu lugar.

              </div>


            </div>






            <div className="detail-form-grid">



              <div className="form-field">

                <label className="form-label">
                  Nombre
                </label>


                <input

                  className="form-input"

                  value={form.nombre}

                  onChange={setField("nombre")}

                  placeholder="Ej: Ana"

                />


              </div>







              <div className="form-field">


                <label className="form-label">

                  Habitación

                </label>



                <input

                  className="form-input"

                  value={form.habitacion}

                  onChange={setField("habitacion")}

                  placeholder="Ej: 204"

                />


              </div>








              <div className="form-field">


                <label className="form-label">

                  Edad

                </label>



                <input

                  className="form-input"

                  type="number"

                  min="1"

                  value={form.edad}

                  onChange={setField("edad")}

                  placeholder="Ej: 28"

                />



              </div>



            </div>








            <button


              className="btn-primary"


              disabled={

                procesando ||

                actividad.estado === "CANCELADA" ||

                actividad.estado === "FINALIZADA" ||

                !form.nombre ||

                !form.habitacion ||

                !form.edad

              }



              onClick={handleInscribirse}


            >


              {procesando

                ? "Procesando..."

                : actividad.cuposDisponibles <= 0

                ? "Anotarme en lista de espera"

                : "Confirmar reserva"

              }


            </button>



          </div>




        </div>



      </div>



    </div>

  );

}