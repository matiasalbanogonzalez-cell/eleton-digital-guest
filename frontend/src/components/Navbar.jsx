import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Home, Sparkles, Theater, Droplet, Coffee, PartyPopper, Key } from "lucide-react";
import MobileNavigation from "./MobileNavigation";

const NAV_LINKS = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/recreacion", label: "Recreación", icon: Sparkles },
  { to: "/teatro", label: "Teatro", icon: Theater },
  { to: "/spa", label: "Spa", icon: Droplet },
  { to: "/resto", label: "Restó", icon: Coffee },
  { to: "/eventos", label: "Eventos", icon: PartyPopper },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="navbar-brand-mark">E</span>
          <span className="navbar-brand-copy">
            <span className="navbar-brand-title">ELETON</span>
            <span className="navbar-brand-subtitle">Digital Guest</span>
          </span>
        </Link>

        <nav className="navbar-links">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `navbar-link ${isActive ? "is-active" : ""}`}
              >
                <Icon className="navbar-link-icon" size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <NavLink to="/login" className="navbar-link navbar-link-cta">
            <Key className="navbar-link-icon" size={16} />
            Acceso personal
          </NavLink>
        </nav>

        <button
          className={`navbar-toggle ${open ? "is-open" : ""}`}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </>
  );
}