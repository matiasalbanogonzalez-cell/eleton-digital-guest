import { Link } from "react-router-dom";
import { Building2, Sparkles, Theater, Droplet, Coffee, Info } from "lucide-react";

const ICONS = {
  hotel: Building2,
  recreacion: Sparkles,
  teatro: Theater,
  spa: Droplet,
  resto: Coffee,
  informacion: Info,
};

export default function ModuleCard({ modulo }) {
  const Icon = ICONS[modulo.id] || Sparkles;

  return (
    <Link to={modulo.path} className={`module-card ${modulo.activo ? "is-active" : ""}`}>
      <div className="module-card-media">
        <div className="module-card-icon">
          <Icon size={22} />
        </div>
        <div>
          <div className="module-card-label">{modulo.label}</div>
          <div className="module-card-tagline">{modulo.tagline}</div>
        </div>
      </div>
      {!modulo.activo && <span className="module-card-badge">Próximamente</span>}
    </Link>
  );
}
