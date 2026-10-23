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
      const data = await api.login({
        email,
        password,
      });

      // Guardamos la sesión
      guardarSesion(data);

      // Redirección según el rol
      if (data.usuario.rol === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (data.usuario.rol === "RECREADOR") {
        navigate("/recreacion/panel");
      } else if (data.usuario.rol === "ADMIN_RESTO") {
        navigate("/resto/panel");
      } else if (data.usuario.rol === "ADMIN_SPA") {
        navigate("/spa/panel");
      } else if (data.usuario.rol === "ADMIN_TEATRO") {
        navigate("/teatro/panel");
      } else {
        navigate("/recreacion");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="app-frame"
      style={{
        justifyContent: "center",
        padding: 32,
      }}
    >

      <div
        style={{
          textAlign: "center",
          marginBottom: 28,
        }}
      >

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 16px auto",
          }}
        >
          🌴
        </div>

        <div
          className="font-display"
          style={{
            color: "var(--paper)",
            fontSize: 32,
          }}
        >
          ACCESO PERSONAL
        </div>

        <div
          className="font-mono"
          style={{
            color: "var(--paper-2)",
            opacity: 0.7,
            fontSize: 12,
            marginTop: 6,
          }}
        >
          Ingresá con tu cuenta de huésped o de personal del hotel
        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--paper)",
          borderRadius: 16,
          padding: 20,
        }}
      >

        <div className="form-field">

          <label className="form-label">
            Email
          </label>

          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@eleton.com"
          />

        </div>

        <div className="form-field">

          <label className="form-label">
            Contraseña
          </label>

          <input
            className="form-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

        </div>

        {error && (
          <div
            style={{
              color: "#B23A2E",
              fontSize: 12.5,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          style={{
            width: "100%",
          }}
          disabled={cargando}
          type="submit"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

      </form>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <span className="font-mono" style={{ fontSize: 12, color: "var(--paper-2)", opacity: 0.7 }}>
          ¿Sos huésped y todavía no tenés cuenta?{" "}
        </span>
        <Link to="/registro" className="font-mono" style={{ fontSize: 12, color: "var(--gold)" }}>
          Creá tu cuenta
        </Link>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 18,
          fontSize: 10.5,
          color: "var(--paper-2)",
          opacity: 0.5,
        }}
      >
        Demo: huesped@demo.com / password123
      </div>

    </div>
  );
}