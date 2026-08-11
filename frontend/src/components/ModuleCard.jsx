import { Link } from "react-router-dom";
import { Building2, Sparkles, Theater, Droplet, Coffee, Info, ChevronRight } from "lucide-react";

const ICONS = {
  hotel: Building2,
  recreacion: Sparkles,
  teatro: Theater,
  spa: Droplet,
  resto: Coffee,
  informacion: Info,
};

// Identidad de color por módulo: acento sólido (ícono + borde) y su
// variante suave (fondo del ícono). Coherente con la paleta cálida de Eleton.
const ACCENTS = {
  hotel: { solid: "#96703E", soft: "#EFE6D3" },
  recreacion: { solid: "#C97C4D", soft: "#F5E1D3" },
  teatro: { solid: "#7A3B36", soft: "#EEDAD8" },
  spa: { solid: "#4F7A6C", soft: "#DCEAE5" },
  resto: { solid: "#B8862F", soft: "#F2E6CC" },
  informacion: { solid: "#4A6670", soft: "#DCE6E8" },
};

export default function ModuleCard({ modulo }) {
  const Icon = ICONS[modulo.id] || Sparkles;
  const accent = ACCENTS[modulo.id] || { solid: "var(--gold)", soft: "var(--paper-2)" };

  return (
    <Link
      to={modulo.path}
      className={`module-card ${modulo.activo ? "is-active" : ""}`}
      style={{ "--accent": accent.solid, "--accent-soft": accent.soft }}
    >
      <span className="module-card-icon">
        <Icon size={21} strokeWidth={2} />
      </span>

      <span className="module-card-text">
        <span className="module-card-label">{modulo.label}</span>
        <span className="module-card-tagline">{modulo.tagline}</span>
      </span>

      <span className="module-card-end">
        <ChevronRight size={18} className="module-card-chevron" />
      </span>
    </Link>
  );
}