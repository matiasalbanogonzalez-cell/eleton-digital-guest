import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ModuloPlaceholder from "./pages/ModuloPlaceholder";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Actividades from "./pages/Actividades";
import DetalleActividad from "./pages/DetalleActividad";
import MisActividades from "./pages/MisActividades";
import PanelRecreador from "./pages/PanelRecreador";
import RutaProtegida from "./components/RutaProtegida";
import { MODULOS } from "./constants/modulos";

export default function App() {
  return (
    <Routes>
      {/* Plataforma pública */}
      <Route path="/" element={<Home />} />

      {/* Acceso de personal del hotel (se conserva tal cual funcionaba) */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Módulo Recreación — público para huéspedes */}
      <Route path="/recreacion" element={<Actividades />} />
      <Route path="/recreacion/actividades/:id" element={<DetalleActividad />} />
      <Route
        path="/recreacion/mis-actividades"
        element={<RutaProtegida><MisActividades /></RutaProtegida>}
      />
      <Route
        path="/recreacion/panel"
        element={
          <RutaProtegida rolesPermitidos={["RECREADOR", "ADMIN"]}>
            <PanelRecreador />
          </RutaProtegida>
        }
      />

      {/* Módulos todavía no desarrollados: página placeholder profesional */}
      {MODULOS.filter((m) => !m.activo).map((m) => (
        <Route key={m.id} path={m.path} element={<ModuloPlaceholder modulo={m} />} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
