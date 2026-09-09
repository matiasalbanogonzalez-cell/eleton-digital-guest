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

  // =========================
  // RESTÓ
  // =========================

  listarServiciosResto: () =>
    request("/resto/servicios"),

  listarHorariosResto: (servicioId) =>
    request(`/resto/horarios?servicioId=${servicioId}`),

  consultarDisponibilidadResto: (fecha, servicioId, personas, horarioId) => {
    const params = new URLSearchParams({ fecha, servicioId, personas });
    if (horarioId) params.set("horarioId", horarioId);
    return request(`/resto/disponibilidad?${params.toString()}`);
  },

  crearReservaResto: (payload) =>
    request("/resto/reservas", {
      method: "POST",
      body: payload,
    }),

  panelResto: (token, fecha) =>
    request(`/resto/panel${fecha ? `?fecha=${fecha}` : ""}`, {
      token,
    }),

  listarReservasResto: (token, filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const query = params.toString();
    return request(`/resto/reservas${query ? `?${query}` : ""}`, {
      token,
    });
  },

  cancelarReservaResto: (token, id) =>
    request(`/resto/reservas/${id}/cancelar`, {
      method: "PATCH",
      token,
    }),

  listarSalonesResto: (token) =>
    request("/resto/salones", {
      token,
    }),

  crearSalonResto: (token, payload) =>
    request("/resto/salones", {
      method: "POST",
      body: payload,
      token,
    }),

  editarSalonResto: (token, id, payload) =>
    request(`/resto/salones/${id}`, {
      method: "PUT",
      body: payload,
      token,
    }),

  toggleEstadoSalonResto: (token, id) =>
    request(`/resto/salones/${id}/estado`, {
      method: "PATCH",
      token,
    }),

  configDisponibilidadResto: (token, fecha) =>
    request(`/resto/config-disponibilidad?fecha=${fecha}`, {
      token,
    }),

  actualizarConfigDisponibilidadResto: (token, payload) =>
    request("/resto/config-disponibilidad", {
      method: "PUT",
      body: payload,
      token,
    }),

  // =========================
  // SPA
  // =========================

  listarHorariosSpa: (fecha, personasAdultos, personasNinos) => {
    const params = new URLSearchParams({ fecha, personasAdultos, personasNinos: personasNinos || 0 });
    return request(`/spa/horarios?${params.toString()}`);
  },

  crearReservaSpa: (payload) => request("/spa/reservas", { method: "POST", body: payload }),

  panelSpa: (token, fecha) => request(`/spa/panel${fecha ? `?fecha=${fecha}` : ""}`, { token }),
  listarReservasSpa: (token, filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    const query = params.toString();
    return request(`/spa/reservas${query ? `?${query}` : ""}`, { token });
  },
  cancelarReservaSpa: (token, id) => request(`/spa/reservas/${id}/cancelar`, { method: "PATCH", token }),

  listarTemporadasSpa: (token) => request("/spa/temporadas", { token }),
  crearTemporadaSpa: (token, payload) => request("/spa/temporadas", { method: "POST", body: payload, token }),
  editarTemporadaSpa: (token, id, payload) => request(`/spa/temporadas/${id}`, { method: "PUT", body: payload, token }),
  eliminarTemporadaSpa: (token, id) => request(`/spa/temporadas/${id}`, { method: "DELETE", token }),

  listarHorarioBaseSpa: (token) => request("/spa/horario-base", { token }),
  guardarHorarioBaseSpa: (token, payload) => request("/spa/horario-base", { method: "PUT", body: payload, token }),

  listarRestriccionesNinosSpa: (token) => request("/spa/restricciones-ninos", { token }),
  crearRestriccionNinosSpa: (token, payload) => request("/spa/restricciones-ninos", { method: "POST", body: payload, token }),
  eliminarRestriccionNinosSpa: (token, id) => request(`/spa/restricciones-ninos/${id}`, { method: "DELETE", token }),

  // =========================
  // TEATRO
  // =========================

  listarFuncionesTeatro: (desde) => request(`/teatro/funciones${desde ? `?desde=${desde}` : ""}`),
  crearReservaTeatro: (payload) => request("/teatro/reservas", { method: "POST", body: payload }),

  panelTeatro: (token, fecha) => request(`/teatro/panel${fecha ? `?fecha=${fecha}` : ""}`, { token }),
  listarReservasTeatro: (token, filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    const query = params.toString();
    return request(`/teatro/reservas${query ? `?${query}` : ""}`, { token });
  },
  cancelarReservaTeatro: (token, id) => request(`/teatro/reservas/${id}/cancelar`, { method: "PATCH", token }),

  listarFormatosTeatro: (token) => request("/teatro/formatos", { token }),
  crearFormatoTeatro: (token, payload) => request("/teatro/formatos", { method: "POST", body: payload, token }),
  editarFormatoTeatro: (token, id, payload) => request(`/teatro/formatos/${id}`, { method: "PUT", body: payload, token }),

  listarFuncionesAdminTeatro: (token, fecha) => request(`/teatro/admin/funciones${fecha ? `?fecha=${fecha}` : ""}`, { token }),
  crearFuncionTeatro: (token, payload) => request("/teatro/admin/funciones", { method: "POST", body: payload, token }),
  editarFuncionTeatro: (token, id, payload) => request(`/teatro/admin/funciones/${id}`, { method: "PUT", body: payload, token }),

  // =========================
  // AVISOS
  // =========================

  listarAvisos: (habitacion, seccion) => {
    const params = new URLSearchParams();
    if (habitacion) params.set("habitacion", habitacion);
    if (seccion) params.set("seccion", seccion);
    const query = params.toString();
    return request(`/avisos${query ? `?${query}` : ""}`);
  },
  listarZonasHotel: () => request("/avisos/zonas"),

  listarAvisosAdmin: (token) => request("/avisos/admin", { token }),
  crearAviso: (token, payload) => request("/avisos/admin", { method: "POST", body: payload, token }),
  editarAviso: (token, id, payload) => request(`/avisos/admin/${id}`, { method: "PUT", body: payload, token }),
  toggleActivoAviso: (token, id) => request(`/avisos/admin/${id}/estado`, { method: "PATCH", token }),
  eliminarAviso: (token, id) => request(`/avisos/admin/${id}`, { method: "DELETE", token }),

  // =========================
  // ADMIN — dashboard central
  // =========================

  dashboardAdmin: (token, fecha) => request(`/admin/dashboard${fecha ? `?fecha=${fecha}` : ""}`, { token }),
  todasLasReservas: (token, filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    const query = params.toString();
    return request(`/admin/reservas${query ? `?${query}` : ""}`, { token });
  },

  // =========================
  // SUGERENCIAS
  // =========================

  crearSugerencia: (payload) =>
    request("/sugerencias", {
      method: "POST",
      body: payload,
    }),

  listarSugerenciasAdmin: (token, filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    const query = params.toString();
    return request(`/sugerencias/admin${query ? `?${query}` : ""}`, { token });
  },

  actualizarSugerencia: (token, id, payload) =>
    request(`/sugerencias/admin/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    }),

};
