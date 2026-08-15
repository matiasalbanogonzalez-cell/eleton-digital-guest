import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import ModuleCard from "../components/ModuleCard";
import { MODULOS } from "../constants/modulos";

export default function Home() {
  return (
    <PublicLayout>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-eyebrow font-mono">ELETON DIGITAL GUEST</div>
          <h1 className="hero-title font-display">Bienvenidos a Hotel Eleton</h1>
          <p className="hero-sub">
            Tu estadía, en la palma de la mano. Descubrí experiencias pensadas para descansar,
            divertirte y reconectar en un resort premium.
          </p>

        </div>

        <div className="hero-image-card">
          <div className="hero-image-glow" />
          <div className="hero-image-content">
            <div className="hero-image-tag">Experiencias Eleton</div>
            <div className="hero-image-copy">
              actividades para toda la familia y atardeceres de ensueño....
            </div>
          </div>
        </div>
      </section>

      <section className="module-section">
        <div className="section-row">
          <div>
            <div className="section-eyebrow font-mono">Explorá el resort</div>

          </div>
        </div>

        <div className="module-grid">
          {MODULOS.map((m) => (
            <ModuleCard key={m.id} modulo={m} />
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-row">
          <div>
            <div className="section-eyebrow font-mono">Destacados</div>
            <h2 className="section-title font-display">Lo mejor del día</h2>
          </div>
        </div>

        <div className="featured-grid">
          <article className="featured-card featured-card-large">
            <div className="featured-card-copy">
              <div className="featured-card-eyebrow font-mono">Actividad del día</div>
              <h3>Bingo Familiar</h3>
              <p>Disfrutá de una tarde de diversión con tu familia en nuestro bingo familiar.</p>
            </div>
          </article>
          <Link to="/resto" className="featured-card featured-card-link">
            <div className="featured-card-eyebrow font-mono">Restó</div>
            <h3>Plato del día</h3>
            <p>Sabores locales con una carta fresca y elegante para cada momento del día.</p>
            <span className="featured-card-cta">Ingresá a la carta para ver mas opciones→</span>
          </Link>
          <article className="featured-card">
            <div className="featured-card-eyebrow font-mono">Eventos</div>
            <h3>Proximos Eventos</h3>
            <p>Sala Francisco</p>
            <p>Salon Mahatama</p>
            <p>Sala de reuniones</p>
          </article>
        </div>
      </section>

      <section className="info-section">
        <div className="section-row section-row-split">
          <div>
            <div className="section-eyebrow font-mono">Consultas rápidas</div>
            <h2 className="section-title font-display">Horarios y detalles</h2>
          </div>
          <div className="info-compact">
            <div>
              <span className="info-label">Desayuno</span>
              <p>de 08:00 hs a 10:30 hs</p>
            </div>
            <div>
              <span className="info-label">Check-in</span>
              <p>16:00 hs</p>
            </div>
            <div>
              <span className="info-label">Check-out</span>
              <p>10:00 hs</p>
            </div>
            <div>
              <span className="info-label">Recreación</span>
              <p>Actividades de 10:00 hs a 18:00 hs</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}