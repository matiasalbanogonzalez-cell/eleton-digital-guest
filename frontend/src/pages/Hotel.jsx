import { Link } from "react-router-dom";
import {
    UtensilsCrossed,
    Waves,
    Droplets,
    Theater,
    Flag,
    ParkingCircle,
    Sparkles,
    PartyPopper,
    Presentation,
    Users,
    Clock,
    Coffee,
    BellRing,
    HelpCircle,
    Wifi,
} from "lucide-react";

import PublicLayout from "../components/PublicLayout";

const SERVICIOS = [
    { icon: UtensilsCrossed, label: "Restaurant & Bar" },
    { icon: Waves, label: "Piscina con vista panorámica" },
    { icon: Droplets, label: "Piscina cubierta climatizada" },
    { icon: Theater, label: "Teatro concert" },
    { icon: Flag, label: "Actividades recreativas" },
    { icon: ParkingCircle, label: "Estacionamiento cubierto" },
    { icon: Sparkles, label: "Spa y estética" },
    { icon: PartyPopper, label: "Salón de eventos" },
    { icon: Presentation, label: "Sala de conferencias" },
    { icon: Users, label: "Sala de reuniones" },
];

const NUMEROS_IMPORTANTES = [
    { icon: BellRing, label: "Recepción", valor: "Interno 9" },
    { icon: UtensilsCrossed, label: "Restó", valor: "Interno 2227" },
    { icon: Sparkles, label: "Spa", valor: "Interno 1149" },
    { icon: HelpCircle, label: "Guest Service", valor: "Interno 2243" },
];

const WIFI_REDES = [
    { zona: "Áreas públicas", red: "Invitados", clave: "1231231230" },
    { zona: "Habitaciones", red: "Rooms Eleton", clave: "1122334455" },
];

export default function Hotel() {
    return (
        <PublicLayout>
            {/* HERO */}
            <section className="placeholder-hero hotel-hero">
                <Link to="/" className="btn-ghost placeholder-back">
                    ← Inicio
                </Link>

                <div className="section-title-eyebrow font-mono">Villa Carlos Paz, Córdoba</div>
                <h1 className="hero-title font-display spa-hero-title">Hotel Eleton</h1>
            </section>

            {/* SERVICIOS */}
            <section className="spa-services-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Servicios destacados</div>
                        <h2 className="section-title font-display">Todo lo que Eleton tiene para vos</h2>
                    </div>
                </div>

                <div className="spa-services-grid">
                    {SERVICIOS.map(({ icon: Icon, label }) => (
                        <div className="spa-service-item" key={label}>
                            <span className="spa-service-icon">
                                <Icon size={18} />
                            </span>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* NÚMEROS IMPORTANTES */}
            <section className="hotel-numeros-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Durante tu estadía</div>
                        <h2 className="section-title font-display">Números importantes</h2>
                        <p className="section-title-sub">
                            Marcá directo desde el teléfono de tu habitación.
                        </p>
                    </div>
                </div>

                <div className="spa-contact-grid">
                    {NUMEROS_IMPORTANTES.map(({ icon: Icon, label, valor }) => (
                        <div className="spa-contact-card spa-contact-card-static" key={label}>
                            <span className="spa-contact-icon">
                                <Icon size={18} />
                            </span>
                            <span>
                                <span className="info-label">{label}</span>
                                <p>{valor}</p>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* HORARIOS */}
            <section className="hotel-horarios-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Horarios</div>
                        <h2 className="section-title font-display">Organizá tu estadía</h2>
                    </div>
                </div>

                <div className="hotel-horarios-grid">
                    {/* SPA */}
                    <div className="hotel-horario-card">
                        <div className="hotel-horario-header">
                            <span className="hotel-horario-icon">
                                <Sparkles size={18} />
                            </span>
                            <div>
                                <div className="info-label">Bienestar</div>
                                <h3>SPA</h3>
                            </div>
                        </div>

                        <div className="hotel-horario-item">
                            <Clock size={16} />
                            <span>
                                Todos los días
                                <strong>09:00 a 21:00</strong>
                            </span>
                        </div>
                    </div>

                    {/* RESTÓ */}
                    <div className="hotel-horario-card">
                        <div className="hotel-horario-header">
                            <span className="hotel-horario-icon">
                                <UtensilsCrossed size={18} />
                            </span>
                            <div>
                                <div className="info-label">Gastronomía</div>
                                <h3>Restó</h3>
                            </div>
                        </div>

                        <div className="hotel-horario-item">
                            <Coffee size={16} />
                            <span>
                                Desayuno
                                <strong>08:00 a 10:30</strong>
                            </span>
                        </div>

                        <div className="hotel-horario-item">
                            <UtensilsCrossed size={16} />
                            <span>
                                Almuerzo
                                <strong>12:00 a 15:00</strong>
                            </span>
                        </div>

                        <div className="hotel-horario-item">
                            <UtensilsCrossed size={16} />
                            <span>
                                Cena
                                <strong>20:30 a 23:30</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* WIFI */}
            <section className="hotel-wifi-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Conectividad</div>
                        <h2 className="section-title font-display">WiFi del hotel</h2>
                    </div>
                </div>

                <div className="hotel-wifi-grid">
                    {WIFI_REDES.map((w) => (
                        <div className="hotel-wifi-card" key={w.red}>
                            <span className="hotel-wifi-icon">
                                <Wifi size={18} />
                            </span>
                            <div>
                                <div className="info-label">{w.zona}</div>
                                <p className="hotel-wifi-red">{w.red}</p>
                                <p className="hotel-wifi-clave">Clave: {w.clave}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}