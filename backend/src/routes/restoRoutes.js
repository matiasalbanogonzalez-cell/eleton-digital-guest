const { Router } = require("express");
const ctrl = require("../controllers/restoController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// --- Público: flujo de reserva del huésped ---
router.get("/servicios", ctrl.listarServicios);
router.get("/horarios", ctrl.listarHorarios);
router.get("/disponibilidad", ctrl.consultarDisponibilidad);
router.post("/reservas", ctrl.crearReserva);

// --- Administración del Resto ---
// ADMIN_RESTO y ADMIN pueden administrar Resto

router.get(
    "/panel",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.panelResumen
);

router.get(
    "/reservas",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.listarReservas
);

router.patch(
    "/reservas/:id/cancelar",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.cancelarReserva
);

router.get(
    "/salones",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.listarSalones
);

router.post(
    "/salones",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.crearSalon
);

router.put(
    "/salones/:id",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.editarSalon
);

router.patch(
    "/salones/:id/estado",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.toggleEstadoSalon
);

router.get(
    "/config-disponibilidad",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.obtenerConfigDisponibilidad
);

router.put(
    "/config-disponibilidad",
    requiereAuth,
    requiereRol("ADMIN_RESTO", "ADMIN"),
    ctrl.actualizarConfigDisponibilidad
);

module.exports = router;