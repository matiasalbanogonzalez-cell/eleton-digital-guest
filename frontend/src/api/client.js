const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  registrar: (payload) => request("/auth/registro", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  yo: (token) => request("/auth/yo", { token }),

  // Actividades
  listarActividades: (token, categoria) =>
    request(`/actividades${categoria && categoria !== "TODAS" ? `?categoria=${categoria}` : ""}`, { token }),
  obtenerActividad: (token, id) => request(`/actividades/${id}`, { token }),
  crearActividad: (token, payload) => request("/actividades", { method: "POST", body: payload, token }),
  editarActividad: (token, id, payload) => request(`/actividades/${id}`, { method: "PUT", body: payload, token }),
  cancelarActividad: (token, id) => request(`/actividades/${id}/cancelar`, { method: "POST", token }),
  listarParticipantes: (token, id) => request(`/actividades/${id}/participantes`, { token }),
  marcarAsistencia: (token, inscripcionId, asistio) =>
    request(`/actividades/inscripciones/${inscripcionId}/asistencia`, { method: "PATCH", body: { asistio }, token }),

  // Inscripciones
  inscribirse: (payload, token) => {
    if (typeof payload === "string") {
      return request("/inscripciones", { method: "POST", body: { actividadId: payload }, token });
    }
    return request("/inscripciones", { method: "POST", body: payload, token });
  },
  cancelarInscripcion: (token, actividadId) => request(`/inscripciones/${actividadId}`, { method: "DELETE", token }),
  misActividades: (token) => request("/inscripciones/mias", { token }),
};
