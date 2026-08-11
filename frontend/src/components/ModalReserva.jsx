import { useState } from "react";
import { api } from "../api/client";

export default function ModalReserva({ actividad, cerrar }) {

  const [form, setForm] = useState({
    nombre: "",
    habitacion: "",
    edad: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function reservar(e) {
    e.preventDefault();

    try {

      const respuesta = await api.inscribirse({
        actividadId: actividad.id,
        nombre: form.nombre,
        habitacion: form.habitacion,
        edad: form.edad
      });

      setMensaje(
        respuesta.estado === "LISTA_ESPERA"
        ? "Actividad completa. Quedaste en lista de espera."
        : "Reserva confirmada."
      );

    } catch(err) {
      setError(err.message);
    }
  }


  return (

    <div className="modal-overlay">

      <div className="modal-reserva">

        <button 
          className="modal-cerrar"
          onClick={cerrar}
        >
          ✕
        </button>


        <h2>
          Reservar
        </h2>

        <h3>
          {actividad.nombre}
        </h3>


        {!mensaje ? (

          <form onSubmit={reservar}>

            <input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e)=>setForm({
                ...form,
                nombre:e.target.value
              })}
            />


            <input
              placeholder="Habitación"
              value={form.habitacion}
              onChange={(e)=>setForm({
                ...form,
                habitacion:e.target.value
              })}
            />


            <input
              type="number"
              placeholder="Edad"
              value={form.edad}
              onChange={(e)=>setForm({
                ...form,
                edad:e.target.value
              })}
            />


            <button className="btn-confirmar">
              Confirmar reserva
            </button>


          </form>

        ) : (

          <p>{mensaje}</p>

        )}


        {error && (
          <p className="error">
            {error}
          </p>
        )}

      </div>

    </div>

  );
}