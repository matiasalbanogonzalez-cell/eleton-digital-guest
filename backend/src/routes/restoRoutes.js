const { Router } = require("express");
const ctrl = require("../controllers/restoController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// --- Público: flujo de reserva del huésped (sin login, igual que Recreación) ---
router.get("/servicios", ctrl.listarServicios);
router.get("/horarios", ctrl.listarHorarios);
router.get("/disponibilidad", ctrl.consultarDisponibilidad);
router.post("/reservas", ctrl.crearReserva);

// --- Administración del Restó: solo ADMIN ---
router.get("/panel", requiereAuth, requiereRol("ADMIN"), ctrl.panelResumen);
router.get("/reservas", requiereAuth, requiereRol("ADMIN"), ctrl.listarReservas);
router.patch("/reservas/:id/cancelar", requiereAuth, requiereRol("ADMIN"), ctrl.cancelarReserva);

router.get("/salones", requiereAuth, requiereRol("ADMIN"), ctrl.listarSalones);
router.post("/salones", requiereAuth, requiereRol("ADMIN"), ctrl.crearSalon);
router.put("/salones/:id", requiereAuth, requiereRol("ADMIN"), ctrl.editarSalon);
router.patch("/salones/:id/estado", requiereAuth, requiereRol("ADMIN"), ctrl.toggleEstadoSalon);

router.get("/config-disponibilidad", requiereAuth, requiereRol("ADMIN"), ctrl.obtenerConfigDisponibilidad);
router.put("/config-disponibilidad", requiereAuth, requiereRol("ADMIN"), ctrl.actualizarConfigDisponibilidad);

module.exports = router;