import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ModuloPlaceholder from "./pages/ModuloPlaceholder";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Actividades from "./pages/Actividades";
import DetalleActividad from "./pages/DetalleActividad";
import MisActividades from "./pages/MisActividades";
import PanelRecreador from "./pages/PanelRecreador";
import Spa from "./pages/Spa";
import ReservaSpa from "./pages/ReservaSpa";
import PanelSpa from "./pages/PanelSpa";
import Hotel from "./pages/Hotel";
import Resto from "./pages/Resto";
import ReservaResto from "./pages/ReservaResto";
import PanelResto from "./pages/PanelResto";
import Teatro from "./pages/Teatro";
import PanelTeatro from "./pages/PanelTeatro";
import Dashboard from "./pages/Dashboard";
import TodasLasReservas from "./pages/TodasLasReservas";
import PanelAvisos from "./pages/PanelAvisos";
import PanelInstructores from "./pages/PanelInstructores";
import Sugerencias from "./pages/Sugerencias";
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

      {/* Módulo Spa — público para huéspedes */}
      <Route path="/spa" element={<Spa />} />
      <Route path="/spa/reservar" element={<ReservaSpa />} />
      <Route
        path="/spa/panel"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN", "ADMIN_SPA"]}>
            <PanelSpa />
          </RutaProtegida>
        }
      />

      {/* Módulo Hotel — público para huéspedes */}
      <Route path="/hotel" element={<Hotel />} />

      {/* Módulo Restó — carta y reservas embebidas */}
      <Route path="/resto" element={<Resto />} />
      <Route path="/resto/reservar" element={<ReservaResto />} />
      <Route
        path="/resto/panel"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN", "ADMIN_RESTO"]}>
            <PanelResto />
          </RutaProtegida>
        }
      />

      {/* Módulo Teatro — público para huéspedes */}
      <Route path="/teatro" element={<Teatro />} />
      <Route
        path="/teatro/panel"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN", "ADMIN_TEATRO"]}>
            <PanelTeatro />
          </RutaProtegida>
        }
      />

      {/* Módulo Sugerencias — público para huéspedes */}
      <Route path="/sugerencias" element={<Sugerencias />} />

      {/* Eleton Admin — dashboard central, solo ADMIN general */}
      <Route
        path="/admin/dashboard"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN"]}>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/admin/reservas"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN"]}>
            <TodasLasReservas />
          </RutaProtegida>
        }
      />
      <Route
        path="/admin/avisos"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN"]}>
            <PanelAvisos />
          </RutaProtegida>
        }
      />
      <Route
        path="/admin/instructores"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN"]}>
            <PanelInstructores />
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
