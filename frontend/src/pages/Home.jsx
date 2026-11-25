import { Link } from "react-router-dom";
import { ChevronRight, Coffee, LogIn, LogOut, MessageSquare } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { MODULOS } from "../constants/modulos";
import "../styles/home-premium.css";

// Foto de cada módulo (archivos en frontend/public/img/home).
// Los módulos sin foto muestran su ícono.
const FOTO_MODULO = {
  hotel: "hp-img-hotel",
  recreacion: "hp-img-recreacion",
  teatro: "hp-img-teatro",
  spa: "hp-img-spa",
  resto: "hp-img-resto",
  eventos: "hp-img-eventos",
};

const ICONO_MODULO = {
  sugerencias: MessageSquare,
};

const HORARIOS = [
  { label: "Desayuno", valor: "de 08:00 hs a 10:30 hs", Icon: Coffee },
  { label: "Check-in", valor: "16:00 hs", Icon: LogIn },
  { label: "Check-out", valor: "10:00 hs", Icon: LogOut },
];

function ModuloFoto({ modulo }) {
  const foto = FOTO_MODULO[modulo.id];
  const Icon = ICONO_MODULO[modulo.id];

  return (
    <Link to={modulo.path} className={`hp-photo-card hp-reveal ${foto ? "" : "hp-wide"}`}>
      <div className={`hp-photo ${foto || ""}`} aria-hidden="true" />
      {!foto && Icon && <Icon className="hp-photo-icon" size={56} strokeWidth={1} aria-hidden="true" />}
      <div className="hp-photo-shade" />
      <div className="hp-photo-body">
        <div>
          <h3 className="hp-photo-title">{modulo.label}</h3>
          <p className="hp-photo-text">{modulo.tagline}</p>
        </div>
        <span className="hp-round" aria-hidden="true">
          <ChevronRight size={20} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <div className="hp">
        <section className="hp-hero">
          <div className="hp-hero-media" role="img" aria-label="Piletas y terraza del hotel frente al lago" />
          <div className="hp-hero-shade" />

          <div className="hp-hero-inner">
            <div className="hp-hero-copy">
              <p className="hp-pill hp-in-1">Eleton Digital Guest</p>
              <h1 className="hp-hero-title">
                <span className="hp-in-2">Bienvenidos a</span>
                <em className="hp-in-3">Hotel Eleton</em>
              </h1>
              <p className="hp-hero-sub hp-in-3">
                Tu estadía, en la palma de la mano. Descubrí experiencias pensadas para descansar,
                divertirte y reconectar en un resort premium.
              </p>
              <div className="hp-actions hp-in-3">
                <Link to="/recreacion" className="hp-btn hp-btn-gold">
                  Ver actividades <ChevronRight className="hp-arrow" size={16} />
                </Link>
                <Link to="/hotel" className="hp-btn hp-btn-glass">
                  Información del hotel
                </Link>
              </div>
            </div>

            <aside className="hp-glass-card hp-in-3">
              <div className="hp-glass-tag">
                <span className="hp-dot" />
                Experiencias Eleton
              </div>
              <p className="hp-glass-copy">actividades para toda la familia y atardeceres de ensueño....</p>
            </aside>
          </div>
        </section>

        <section className="hp-section">
          <p className="hp-eyebrow">Explorá el resort</p>
          <div className="hp-rule" />
          <div className="hp-grid hp-grid-modules">
            {MODULOS.map((m) => (
              <ModuloFoto key={m.id} modulo={m} />
            ))}
          </div>
        </section>

        <section className="hp-section">
          <p className="hp-eyebrow">Destacados</p>
          <h2 className="hp-title">Lo mejor del día</h2>

          <div className="hp-grid hp-grid-featured">
            <article className="hp-photo-card hp-reveal">
              <div className="hp-photo hp-img-bingo" role="img" aria-label="Familia jugando al bingo en el hotel" />
              <div className="hp-photo-shade" />
              <div className="hp-photo-body">
                <div>
                  <div className="hp-photo-label">Actividad del día</div>
                  <h3 className="hp-photo-title">Bingo Familiar</h3>
                  <p className="hp-photo-text">
                    Disfrutá de una tarde de diversión con tu familia en nuestro bingo familiar.
                  </p>
                </div>
              </div>
            </article>

            <Link to="/resto" className="hp-photo-card hp-reveal">
              <div className="hp-photo hp-img-resto" role="img" aria-label="Plato del restó" />
              <div className="hp-photo-shade" />
              <div className="hp-photo-body">
                <div>
                  <div className="hp-photo-label">Restó</div>
                  <h3 className="hp-photo-title">Plato del día</h3>
                  <span className="hp-photo-link">Ingresá a la carta para ver mas opciones ›</span>
                </div>
              </div>
            </Link>

            <article className="hp-photo-card hp-reveal">
              <div className="hp-photo hp-img-proximos" role="img" aria-label="Flyer de Los chicos de mi edad en la Sala Francisco" />
              <div className="hp-photo-shade" />
              <div className="hp-photo-body">
                <div>
                  <h3 className="hp-photo-title">Proximos Eventos</h3>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="hp-info hp-reveal">
          <svg className="hp-info-lines" viewBox="0 0 1200 400" preserveAspectRatio="none" fill="none" stroke="#D4BE8A" strokeWidth=".8" aria-hidden="true">
            <path d="M0 60 C200 20 340 90 520 55 S860 0 1200 50" />
            <path d="M0 120 C200 80 340 150 520 115 S860 60 1200 110" />
            <path d="M0 180 C220 140 360 210 540 175 S880 120 1200 170" />
            <path d="M0 240 C220 200 360 270 540 235 S880 180 1200 230" />
            <path d="M0 300 C240 260 380 330 560 295 S900 240 1200 290" />
            <path d="M0 360 C240 320 380 390 560 355 S900 300 1200 350" />
          </svg>

          <div className="hp-info-head">
            <p className="hp-eyebrow">Consultas rápidas</p>
            <h2 className="hp-title">Horarios y detalles</h2>
          </div>

          <div className="hp-info-grid">
            {HORARIOS.map(({ label, valor, Icon }) => (
              <div key={label} className="hp-info-tile">
                <span className="hp-info-icon">
                  <Icon size={24} strokeWidth={1.4} />
                </span>
                <div>
                  <div className="hp-info-label">{label}</div>
                  <div className="hp-info-value">{valor}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
