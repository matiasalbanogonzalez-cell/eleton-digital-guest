import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { guardarSesion } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await api.login({ email, password });
      guardarSesion(data);
      navigate("/recreacion");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="app-frame" style={{ justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%", background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            margin: "0 auto 16px auto",
          }}
        >
          🌴
        </div>
        <div className="font-display" style={{ color: "var(--paper)", fontSize: 32 }}>ACCESO PERSONAL</div>
        <div className="font-mono" style={{ color: "var(--paper-2)", opacity: 0.7, fontSize: 12, marginTop: 6 }}>
          Acceso exclusivo para el personal del hotel
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--paper)", borderRadius: 16, padding: 20 }}>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="huesped@demo.com" />
        </div>
        <div className="form-field">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        <button className="btn-primary" style={{ width: "100%" }} disabled={cargando} type="submit">
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>


      <div style={{ textAlign: "center", marginTop: 24, fontSize: 10.5, color: "var(--paper-2)", opacity: 0.5 }}>
        Demo: huesped@demo.com / juan.perez@eleton.com / admin@eleton.com — password123
      </div>
    </div>
  );
}
