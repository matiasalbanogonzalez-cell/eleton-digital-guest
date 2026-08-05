import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";

export default function ModuloPlaceholder({ modulo }) {
  return (
    <PublicLayout>
      <section className="placeholder-hero">
        <Link to="/" className="btn-ghost placeholder-back">
          ← Inicio
        </Link>

        <div className="placeholder-emoji">{modulo.emoji}</div>
        <div className="placeholder-badge font-mono">Próximamente</div>
        <h1 className="font-display placeholder-title">{modulo.label}</h1>
        <p className="placeholder-tagline">{modulo.tagline}</p>
        <p className="placeholder-text">{modulo.proximamente}</p>

        <Link to="/" className="btn-primary" style={{ display: "inline-block", marginTop: 8 }}>
          Volver al inicio
        </Link>
      </section>
    </PublicLayout>
  );
}
