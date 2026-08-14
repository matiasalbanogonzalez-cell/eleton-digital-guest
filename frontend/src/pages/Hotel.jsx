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
    MapPin,
    Phone,
    Instagram,
    Facebook,
    MessageCircle,
    BedDouble,
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

const HABITACIONES = [
    {
        nombre: "Standard",
        capacidad: "Hasta 3 personas",
        detalle:
            "Cama matrimonial y una individual, con posibilidad de configurarse con tres camas individuales.",
        amenities: "Aire acondicionado frío/calor · Caja de seguridad · TV Led 32'' · Frigobar · Secador de pelo · Cerradura magnética · Teléfono",
    },
    {
        nombre: "Standard con Balcón",
        capacidad: "Hasta 3 personas",
        detalle: "Misma configuración que la Standard, sumando balcón propio.",
        amenities: "Balcón · Aire acondicionado frío/calor · Caja de seguridad · TV Led 32'' · Frigobar · Secador de pelo · Cerradura magnética · Teléfono",
    },
    {
        nombre: "Standard View",
        capacidad: "Hasta 3 personas",
        detalle: "Ubicadas en el piso más alto del hotel, con vista panorámica a la ciudad, las sierras y el lago San Roque.",
        amenities: "Vista panorámica · Aire acondicionado frío/calor · Caja de seguridad · TV Led 32'' · Frigobar · Secador de pelo · Cerradura magnética · Teléfono",
    },
    {
        nombre: "Superior con Balcón",
        capacidad: "Hasta 4 personas",
        detalle: "Ideal para familias o grupos de amigos, con balcón propio.",
        amenities: "Balcón · Aire acondicionado frío/calor · Caja de seguridad · TV Led 32'' · Frigobar · Secador de pelo · Cerradura magnética · Teléfono",
    },
    {
        nombre: "Superior Adaptada",
        capacidad: "Hasta 4 personas",
        detalle: "Cercana al ascensor, con puerta y baño completamente adaptados para movilidad reducida.",
        amenities: "Habitación adaptada · Aire acondicionado frío/calor · Caja de seguridad · TV Led 32'' · Frigobar · Secador de pelo · Cerradura magnética · Teléfono",
    },
];

export default function Hotel() {
    return (
        <PublicLayout>
            <section className="placeholder-hero hotel-hero">
                <Link to="/" className="btn-ghost placeholder-back">
                    ← Inicio
                </Link>

                <div className="section-title-eyebrow font-mono">Villa Carlos Paz, Córdoba</div>
                <h1 className="hero-title font-display spa-hero-title">Hotel Eleton</h1>
                <p className="hero-sub spa-hero-sub">
                    Ubicado en el acceso a la ciudad de Villa Carlos Paz, sobre la ladera de la montaña y
                    con una vista inigualable al lago San Roque y las sierras de Córdoba. Elegancia,
                    comodidad, seguridad, calidad y servicio personalizado hacen de Eleton un referente
                    del destino.
                </p>

                <div className="spa-hero-actions">
                    <a
                        className="btn-primary spa-whatsapp-btn"
                        href="https://wa.me/5493515696990?text=Hola%2C+consulto+desde+la+app+del+hotel"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <MessageCircle size={16} />
                        Consultar por WhatsApp
                    </a>
                </div>
            </section>

            <section className="hotel-regimen-section">
                <div className="hotel-regimen-grid">
                    <div className="hotel-regimen-card">
                        <div className="info-label">Temporada Verano y Semana Santa</div>
                        <p className="hotel-regimen-title">Servicio All Inclusive</p>
                        <p className="hotel-regimen-copy">
                            Todas las comidas y bebidas incluidas, cenas temáticas, obras de teatro y
                            actividades recreativas todos los días.
                        </p>
                    </div>
                    <div className="hotel-regimen-card">
                        <div className="info-label">Resto del año</div>
                        <p className="hotel-regimen-title">Alojamiento con desayuno buffet</p>
                        <p className="hotel-regimen-copy">
                            El mismo confort y atención personalizada, con desayuno buffet incluido cada
                            mañana.
                        </p>
                    </div>
                </div>
            </section>

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

            <section className="hotel-rooms-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Habitaciones & Suites</div>
                        <h2 className="section-title font-display">Elegí tu estilo de estadía</h2>
                    </div>
                </div>

                <div className="hotel-rooms-grid">
                    {HABITACIONES.map((h) => (
                        <div className="hotel-room-card" key={h.nombre}>
                            <div className="hotel-room-header">
                                <span className="hotel-room-icon">
                                    <BedDouble size={18} />
                                </span>
                                <div>
                                    <p className="hotel-room-name">{h.nombre}</p>
                                    <p className="hotel-room-capacity">{h.capacidad}</p>
                                </div>
                            </div>
                            <p className="hotel-room-detalle">{h.detalle}</p>
                            <p className="hotel-room-amenities">{h.amenities}</p>
                        </div>
                    ))}
                </div>
            </section>

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

            <section className="spa-contact-section">
                <div className="section-row">
                    <div>
                        <div className="section-eyebrow font-mono">Contacto</div>
                        <h2 className="section-title font-display">Vení a conocernos</h2>
                    </div>
                </div>

                <div className="spa-contact-grid">
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=Eleton+Resort+%26+SPA+Villa+Carlos+Paz"
                        target="_blank"
                        rel="noreferrer"
                        className="spa-contact-card"
                    >
                        <span className="spa-contact-icon">
                            <MapPin size={18} />
                        </span>
                        <span>
                            <span className="info-label">Ubicación</span>
                            <p>Villa Carlos Paz, Córdoba</p>
                        </span>
                    </a>

                    <a href="tel:+5493541584066" className="spa-contact-card">
                        <span className="spa-contact-icon">
                            <Phone size={18} />
                        </span>
                        <span>
                            <span className="info-label">Recepción</span>
                            <p>+54 9 3541 58-4066</p>
                        </span>
                    </a>

                    <a href="tel:+5493515696990" className="spa-contact-card">
                        <span className="spa-contact-icon">
                            <Phone size={18} />
                        </span>
                        <span>
                            <span className="info-label">Reservas</span>
                            <p>+54 9 351 569-6990</p>
                        </span>
                    </a>

                    <a
                        href="https://www.instagram.com/eletonresort/"
                        target="_blank"
                        rel="noreferrer"
                        className="spa-contact-card"
                    >
                        <span className="spa-contact-icon">
                            <Instagram size={18} />
                        </span>
                        <span>
                            <span className="info-label">Instagram</span>
                            <p>@eletonresort</p>
                        </span>
                    </a>

                    <a
                        href="https://www.facebook.com/eletonresort"
                        target="_blank"
                        rel="noreferrer"
                        className="spa-contact-card"
                    >
                        <span className="spa-contact-icon">
                            <Facebook size={18} />
                        </span>
                        <span>
                            <span className="info-label">Facebook</span>
                            <p>Eleton Resort</p>
                        </span>
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}