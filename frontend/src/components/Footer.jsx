import { MapPin, Mail, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Sparkles size={20} />
        <div>
          <div className="footer-brand-title">ELETON</div>
          <div className="footer-brand-subtitle">Digital Guest</div>
        </div>
      </div>

      <div className="footer-columns">
        <div>
          <h3>Contacto</h3>
          <p>Recepción disponible 24/7 desde tu habitación.</p>
        </div>
        <div>
          <h3>Ubicación</h3>
          <p>
            <MapPin size={14} />
            &nbsp;Hotel Eleton · Costa del Sol
          </p>
          <p>
            <Mail size={14} />
            &nbsp;recepcion@eleton.digital
          </p>
        </div>
      </div>
    </footer>
  );
}
