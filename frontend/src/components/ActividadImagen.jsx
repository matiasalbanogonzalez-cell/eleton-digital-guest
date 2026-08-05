import { useState } from "react";
import { CATS } from "../constants/categorias";

// Ícono de respaldo: un simple destello de línea, neutro y elegante,
// para cuando la actividad todavía no tiene una fotografía real cargada.
function IconoRespaldo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.55 }}>
      <path
        d="M12 2.5L13.8 9.2L20.5 11L13.8 12.8L12 19.5L10.2 12.8L3.5 11L10.2 9.2L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Muestra actividad.imagenUrl cuando existe y carga correctamente.
// Si no hay imagen (o falla la carga), cae en un fondo con degradé
// de la categoría más un ícono sutil — nunca un emoji como imagen principal.
export default function ActividadImagen({ actividad, size = "sm", className, style }) {
  const [fallo, setFallo] = useState(false);
  const cat = CATS[actividad.categoria] || CATS.ADULTOS;
  const hayImagen = Boolean(actividad.imagenUrl) && !fallo;
  const iconoPx = size === "lg" ? 40 : 18;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: cat.color,
        background: hayImagen ? undefined : `linear-gradient(135deg, ${cat.color}, ${cat.soft})`,
        ...style,
      }}
    >
      {hayImagen ? (
        <img
          src={actividad.imagenUrl}
          alt={actividad.nombre}
          onError={() => setFallo(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <IconoRespaldo size={iconoPx} />
      )}
    </div>
  );
}
