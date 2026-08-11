import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("eleton_token"));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!token) {
      setCargando(false);
      return;
    }
    api
      .yo(token)
      .then((data) => setUsuario(data.usuario))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("eleton_token");
      })
      .finally(() => setCargando(false));
  }, [token]);

  function guardarSesion({ token: nuevoToken, usuario: nuevoUsuario }) {
    localStorage.setItem("eleton_token", nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  function cerrarSesion() {
    localStorage.removeItem("eleton_token");
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ token, usuario, cargando, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
