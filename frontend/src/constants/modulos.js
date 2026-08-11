// Catálogo central de módulos de Eleton Digital Guest.
// Única fuente de verdad para: Home, navegación pública y páginas placeholder.
// Agregar un módulo nuevo acá alcanza para que aparezca en toda la app.

export const MODULOS = [
  {
    id: "hotel",
    path: "/hotel",
    label: "Hotel",
    emoji: "🏨",
    activo: false,
    tagline: "Tu estadía, a mano",
    proximamente:
      "Información de tu habitación, servicios del hotel y contacto directo con recepción.",
  },
  {
    id: "recreacion",
    path: "/recreacion",
    label: "Recreación",
    emoji: "🎉",
    activo: true,
    tagline: "Actividades para todas las edades",
    proximamente: null,
  },
  {
    id: "teatro",
    path: "/teatro",
    label: "Teatro",
    emoji: "🎭",
    activo: false,
    tagline: "Shows y espectáculos en vivo",
    proximamente: "Cartelera de funciones y reserva de tu lugar en la sala.",
  },
  {
    id: "spa",
    path: "/spa",
    label: "Spa",
    emoji: "💆",
    activo: true,
    tagline: "Bienestar y relax",
    proximamente: null,
  },
  {
    id: "resto",
    path: "/resto",
    label: "Restó",
    emoji: "🍽️",
    activo: false,
    tagline: "Sabores de autor",
    proximamente: "Nuestra carta, horarios de servicio y reserva de mesa.",
  },
  {
    id: "informacion",
    path: "/informacion",
    label: "Información",
    emoji: "ℹ️",
    activo: false,
    tagline: "Todo lo que necesitás saber",
    proximamente: "Wifi, horarios, mapas del predio y contactos útiles del hotel.",
  },
];

export function obtenerModulo(id) {
  return MODULOS.find((m) => m.id === id);
}