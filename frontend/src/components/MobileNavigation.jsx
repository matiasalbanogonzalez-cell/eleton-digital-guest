import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Theater, Droplet, Coffee, Info, X } from "lucide-react";
import { MODULOS } from "../constants/modulos";

const ICONS = {
  hotel: Home,
  recreacion: Sparkles,
  teatro: Theater,
  spa: Droplet,
  resto: Coffee,
  informacion: Info,
};

export default function MobileNavigation({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`nav-drawer-overlay ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`nav-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="nav-drawer-header">
          <div>
            <div className="font-display nav-drawer-title">ELETON</div>
            <div className="nav-drawer-subtitle">Servicios del resort</div>
          </div>
          <button className="nav-drawer-close" onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <ul className="nav-drawer-list">
          {MODULOS.map((m) => {
            const Icon = ICONS[m.id] || Sparkles;
            return (
              <li key={m.id}>
                <Link
                  to={m.path}
                  className={`nav-drawer-link ${location.pathname.startsWith(m.path) ? "is-current" : ""}`}
                  onClick={onClose}
                >
                  <Icon className="nav-drawer-link-icon" size={16} />
                  <span>{m.label}</span>
                  {!m.activo && <span className="nav-drawer-link-tag">Próximamente</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="nav-drawer-footer">
          <Link to="/login" className="nav-drawer-cta" onClick={onClose}>
            Acceso personal
          </Link>
        </div>
      </aside>
    </>
  );
}
