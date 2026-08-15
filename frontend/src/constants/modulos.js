// Catálogo central de módulos de Eleton Digital Guest.
// Única fuente de verdad para: Home, navegación pública y páginas placeholder.
// Agregar un módulo nuevo acá alcanza para que aparezca en toda la app.

export const MODULOS = [
  {
    id: "hotel",
    path: "/hotel",
    label: "Hotel",
    emoji: "🏨",
    activo: true,
    tagline: "Tu estadía, a mano",
    proximamente: null,
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
    activo: true,
    tagline: "Sabores de autor",
    proximamente: null,
  },
  {
    id: "eventos",
    path: "/eventos",
    label: "Eventos",
    emoji: "🎟️",
    activo: false,
    tagline: "Bodas, congresos y celebraciones",
    proximamente:
      "Salón de eventos, organización de bodas, congresos y celebraciones corporativas. Muy pronto vas a poder consultar disponibilidad desde acá.",
  },
];

export function obtenerModulo(id) {
  return MODULOS.find((m) => m.id === id);
}