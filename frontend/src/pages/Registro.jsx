import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Registro() {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "", habitacion: "", telefono: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { guardarSesion } = useAuth();
  const navigate = useNavigate();

  function set(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = await api.registrar(form);
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
      <div className="font-display" style={{ color: "var(--paper)", fontSize: 28, textAlign: "center", marginBottom: 20 }}>
        CREAR CUENTA
      </div>

      <form onSubmit={handleSubmit} style={{ background: "var(--paper)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-field">
            <label className="form-label">Nombre</label>
            <input className="form-input" required value={form.nombre} onChange={set("nombre")} />
          </div>
          <div className="form-field">
            <label className="form-label">Apellido</label>
            <input className="form-input" required value={form.apellido} onChange={set("apellido")} />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" required value={form.email} onChange={set("email")} />
        </div>
        <div className="form-field">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" required value={form.password} onChange={set("password")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="form-field">
            <label className="form-label">Habitación</label>
            <input className="form-input" value={form.habitacion} onChange={set("habitacion")} placeholder="204" />
          </div>
          <div className="form-field">
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={form.telefono} onChange={set("telefono")} />
          </div>
        </div>
        {error && <div style={{ color: "#B23A2E", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
        <button className="btn-primary" style={{ width: "100%" }} disabled={cargando} type="submit">
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <span className="font-mono" style={{ fontSize: 12, color: "var(--paper-2)", opacity: 0.7 }}>
          ¿Ya tenés cuenta?{" "}
        </span>
        <Link to="/login" className="font-mono" style={{ fontSize: 12, color: "var(--gold)" }}>
          Ingresá
        </Link>
      </div>
    </div>
  );
}
