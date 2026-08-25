import { useEffect, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { api } from "../api/client";
import { getGuestIdentity } from "../utils/guestIdentity";

const ICONO_PRIORIDAD = { ALTA: AlertTriangle, MEDIA: Info, BAJA: Info };

export default function AvisoBanner() {
  const [avisos, setAvisos] = useState([]);
  const [descartados, setDescartados] = useState([]);

  useEffect(() => {
    const identidad = getGuestIdentity();
    api
      .listarAvisos(identidad?.habitacion)
      .then(setAvisos)
      .catch(() => setAvisos([]));
  }, []);

  const visibles = avisos.filter((a) => !descartados.includes(a.id));
  if (visibles.length === 0) return null;

  return (
    <div className="aviso-banner-stack">
      {visibles.map((aviso) => {
        const Icon = ICONO_PRIORIDAD[aviso.prioridad] || Info;
        return (
          <div key={aviso.id} className={`aviso-banner aviso-banner-${aviso.prioridad.toLowerCase()}`}>
            <Icon size={17} className="aviso-banner-icon" />
            <div className="aviso-banner-text">
              <strong>{aviso.titulo}</strong>
              <span>{aviso.mensaje}</span>
            </div>
            <button
              type="button"
              className="aviso-banner-close"
              aria-label="Cerrar aviso"
              onClick={() => setDescartados((d) => [...d, aviso.id])}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
