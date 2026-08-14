import { Link } from "react-router-dom";
import {
    Waves,
    Flame,
    HandHeart,
    Sparkle,
    Activity,
    Scissors,
    Sun,
    Dumbbell,
    Stethoscope,
    Droplet,
    HeartPulse,
    Bone,
    PersonStanding,
    Phone,
    Instagram,
    Facebook,
    MessageCircle,
    Hash,
} from "lucide-react";
import PublicLayout from "../components/PublicLayout";


const SERVICIOS = [
    { icon: Waves, label: "Piscina climatizada con hidromasaje, cascadas y chorros cervicales" },
    { icon: Flame, label: "Sauna húmedo y seco" },
    { icon: HandHeart, label: "Masajes con piedras calientes, manuales y relajantes" },
    { icon: Sparkle, label: "Limpieza facial" },
    { icon: Activity, label: "Reflexología" },
    { icon: Scissors, label: "Peluquería" },
    { icon: Sun, label: "Solarium" },
    { icon: Dumbbell, label: "Gimnasio" },
    { icon: Stethoscope, label: "Medicina estética" },
    { icon: Droplet, label: "Estética facial y corporal" },
    { icon: HeartPulse, label: "Dermatología" },
    { icon: Bone, label: "Osteopatía" },
    { icon: PersonStanding, label: "Kinesiología y Fisioterapia" },
];

export default function Spa() {
    return (
        <PublicLayout>
            <section className="placeholder-hero spa-hero">
                <Link to="/" className="btn-ghost placeholder-back">
                    ← Inicio
                </Link>

                <div className="section-title-eyebrow font-mono">Spa y estética</div>
                <h1 className="hero-title font-display spa-hero-title">Spa Eleton</h1>
                <p className="hero-sub spa-hero-sub">
                    Te invitamos a disfrutar de una experiencia de relajación y belleza, que aúna los
                    mejores servicios de un spa pensado para vos con un centro médico donde podrás
                    realizar consultas y tratamientos estéticos y de salud.
                </p>

                <div className="spa-hero-actions">
                    <a
                        className="btn-primary spa-whatsapp-btn"
                        href="https://wa.me/5493517677652?text=Hola%2C+quiero+reservar+un+turno+en+el+Spa"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <MessageCircle size={16} />
                        Reservar turno por WhatsApp
                    </a>
                    <a
                        className="btn-ghost"
                        href="https://eleton.com.ar/combos-spa"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Ver combos y promociones
                    </a>
                </div>
            </section>

            <section className="spa-services-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Áreas y servicios</div>
                        <h2 className="section-title font-display">
                            Diseñado para que te sientas bien por dentro y por fuera
                        </h2>
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

            <section className="spa-contact-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Contacto</div>
                        <h2 className="section-title font-display">Reservá tu turno</h2>
                    </div>
                </div>

                <div className="spa-contact-grid">
                    <a href="tel:+5493517677652" className="spa-contact-card">
                        <span className="spa-contact-icon">
                            <Phone size={18} />
                        </span>
                        <span>
                            <span className="info-label">Turnos Spa</span>
                            <p>+54 9 351 767-7652</p>
                        </span>
                    </a>

                    <div className="spa-contact-card spa-contact-card-static">
                        <span className="spa-contact-icon">
                            <Hash size={18} />
                        </span>
                        <span>
                            <span className="info-label">Interno Spa</span>
                            <p>1149</p>
                        </span>
                    </div>

                    <div className="spa-contact-card spa-contact-card-static">
                        <span className="spa-contact-icon">
                            <Hash size={18} />
                        </span>
                        <span>
                            <span className="info-label">Interno Guest Service</span>
                            <p>2243</p>
                        </span>
                    </div>

                    <a href="tel:+5493541584066" className="spa-contact-card">
                        <span className="spa-contact-icon">
                            <Phone size={18} />
                        </span>
                        <span>
                            <span className="info-label">Recepción Eleton</span>
                            <p>+54 9 3541 58-4066</p>
                        </span>
                    </a>

                    <a
                        href="https://www.instagram.com/eletonspa"
                        target="_blank"
                        rel="noreferrer"
                        className="spa-contact-card"
                    >
                        <span className="spa-contact-icon">
                            <Instagram size={18} />
                        </span>
                        <span>
                            <span className="info-label">Instagram</span>
                            <p>@eletonspa</p>
                        </span>
                    </a>

                    <a
                        href="https://www.facebook.com/spaeleton"
                        target="_blank"
                        rel="noreferrer"
                        className="spa-contact-card"
                    >
                        <span className="spa-contact-icon">
                            <Facebook size={18} />
                        </span>
                        <span>
                            <span className="info-label">Facebook</span>
                            <p>Spa Eleton</p>
                        </span>
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}