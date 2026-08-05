import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { token, usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/recreacion" replace />;
  }
  return children;
}
