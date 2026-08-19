import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, UtensilsCrossed, Home, CalendarCheck } from "lucide-react";
import PublicLayout from "../components/PublicLayout";

const RESTO_URL = "https://eletonresort.github.io/eletonresto/";

export default function Resto() {
    const [cargando, setCargando] = useState(true);

    return (
        <PublicLayout>
            <section className="placeholder-hero resto-hero">
                <Link to="/" className="btn-ghost placeholder-back">
                    ← Inicio
                </Link>

                <div className="section-title-eyebrow font-mono">Restó</div>
                <h1 className="hero-title font-display spa-hero-title">Eleton Restó &amp; Grill</h1>
                <p className="hero-sub spa-hero-sub">
                    Espacio gastronómico de Eleton Resort &amp; SPA. Consultá la carta completa y
                    reservá tu mesa para desayuno, almuerzo, merienda o cena.
                </p>

                <div className="spa-hero-actions">
                    <Link to="/resto/reservar" className="btn-primary spa-whatsapp-btn">
                        <CalendarCheck size={16} />
                        Reservar mesa
                    </Link>
                    <a
                        className="btn-ghost"
                        href={RESTO_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ExternalLink size={16} />
                        Abrir en pantalla completa
                    </a>
                </div>
            </section>

            <section className="resto-embed-section">
                <div className="resto-embed-frame">
                    {cargando && (
                        <div className="resto-embed-loading">
                            <UtensilsCrossed size={22} />
                            <span>Cargando carta y reservas…</span>
                        </div>
                    )}
                    <iframe
                        src={RESTO_URL}
                        title="Eleton Restó & Grill — Carta y reservas"
                        className="resto-iframe"
                        onLoad={() => setCargando(false)}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    />
                </div>
            </section>

            <Link to="/" className="resto-home-fab" aria-label="Volver al inicio">
                <Home size={20} />
            </Link>
        </PublicLayout>
    );
}