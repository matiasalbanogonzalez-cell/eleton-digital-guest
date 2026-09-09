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
          <h3>Desarrolado por</h3>
          <p>devtry</p>
        </div>
        <div>
          <h3>Ubicación</h3>
          <p>
            <MapPin size={14} />
            &nbsp;Hotel Eleton · Villa Carlos Paz, Córdoba, Argentina
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
