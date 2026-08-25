// Utilidad liviana para recordar nombre + habitación del huésped en este
// dispositivo, una vez que los escribió en cualquier flujo de reserva
// (Restó, Spa, Teatro). No es obligatoria en ningún formulario existente:
// solo se usa para poder filtrar Avisos por zona sin pedirle de nuevo el
// dato al huésped en cada pantalla.
const STORAGE_KEY = "eleton_guest_identity";

export function getGuestIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setGuestIdentity({ nombre, habitacion }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nombre, habitacion }));
  } catch {
    // localStorage puede fallar en navegación privada; no es crítico
  }
}
