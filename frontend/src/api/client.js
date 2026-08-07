const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";


async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });


  if (res.status === 204) {
    return null;
  }


  const data = await res.json().catch(() => null);


  if (!res.ok) {
    throw new Error(
      data?.error || `Error ${res.status}`
    );
  }


  return data;
}



export const api = {

  // =========================
  // AUTH
  // =========================


  registrar: (payload) =>
    request("/auth/registro", {
      method: "POST",
      body: payload,
    }),


  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: payload,
    }),


  yo: (token) =>
    request("/auth/yo", {
      token,
    }),



  // =========================
  // ACTIVIDADES
  // =========================


  // token -> fecha -> categoria
  //
  // ejemplo:
  // listarActividades(undefined,"2026-08-07","KIDS")


  listarActividades: (token, fecha, categoria) => {

    const params = new URLSearchParams();


    if (fecha) {
      params.set("fecha", fecha);
    }


    if (categoria && categoria !== "TODAS") {
      params.set("categoria", categoria);
    }


    const query = params.toString();


    return request(
      `/actividades${query ? `?${query}` : ""}`,
      {
        token,
      }
    );
  },



  obtenerActividad: (token, id) =>
    request(`/actividades/${id}`, {
      token,
    }),



  crearActividad: (token, payload) =>
    request("/actividades", {
      method: "POST",
      body: payload,
      token,
    }),



  editarActividad: (token, id, payload) =>
    request(`/actividades/${id}`, {
      method: "PUT",
      body: payload,
      token,
    }),



  cancelarActividad: (token, id) =>
    request(`/actividades/${id}/cancelar`, {
      method: "POST",
      token,
    }),



  listarParticipantes: (token, id) =>
    request(`/actividades/${id}/participantes`, {
      token,
    }),



  marcarAsistencia: (
    token,
    inscripcionId,
    asistio
  ) =>
    request(
      `/actividades/inscripciones/${inscripcionId}/asistencia`,
      {
        method: "PATCH",
        body: {
          asistio,
        },
        token,
      }
    ),



  // =========================
  // INSCRIPCIONES
  // =========================


  // Huésped sin login
  // recibe:
  //
  // {
  // actividadId,
  // nombre,
  // habitacion,
  // edad
  // }


  inscribirse: (payload) =>
    request("/inscripciones", {
      method: "POST",
      body: payload,
    }),



  cancelarInscripcion: (token, actividadId) =>
    request(`/inscripciones/${actividadId}`, {
      method: "DELETE",
      token,
    }),



  misActividades: (token) =>
    request("/inscripciones/mias", {
      token,
    }),

};