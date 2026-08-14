import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

const IMAGES = {
  teatro: "/images/modules/teatro.jpg",
};

export default function ModuloPlaceholder({ modulo }) {
  const imagen = IMAGES[modulo.id];

  return (
    <PublicLayout>
      <section className="placeholder-hero">
        <Link to="/" className="btn-ghost placeholder-back">
          ← Inicio
        </Link>

        {imagen && (
          <div className="placeholder-image">
            <img src={imagen} alt={modulo.label} />
          </div>
        )}

        <div className="placeholder-content">
          <div className="placeholder-badge font-mono">Hotel Eleton</div>

          <h1 className="font-display placeholder-title">{modulo.label}</h1>

          <p className="placeholder-tagline">{modulo.tagline}</p>

          <p className="placeholder-text">{modulo.proximamente}</p>

          <Link
            to="/"
            className="btn-primary"
            style={{
              display: "inline-block",
              marginTop: 8,
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}