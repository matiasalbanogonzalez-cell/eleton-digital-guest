const { Router } = require("express");
const ctrl = require("../controllers/spaController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// --- Público: flujo de reserva del huésped ---
router.get("/horarios", ctrl.listarHorariosDisponibles);
router.post("/reservas", ctrl.crearReserva);

// --- Administración del Spa (ADMIN o ADMIN_SPA) ---
const puedeAdministrarSpa = requiereRol("ADMIN", "ADMIN_SPA");

router.get("/panel", requiereAuth, puedeAdministrarSpa, ctrl.panelResumen);
router.get("/reservas", requiereAuth, puedeAdministrarSpa, ctrl.listarReservas);
router.patch("/reservas/:id/cancelar", requiereAuth, puedeAdministrarSpa, ctrl.cancelarReserva);

router.get("/temporadas", requiereAuth, puedeAdministrarSpa, ctrl.listarTemporadas);
router.post("/temporadas", requiereAuth, puedeAdministrarSpa, ctrl.crearTemporada);
router.put("/temporadas/:id", requiereAuth, puedeAdministrarSpa, ctrl.editarTemporada);
router.delete("/temporadas/:id", requiereAuth, puedeAdministrarSpa, ctrl.eliminarTemporada);

router.get("/horario-base", requiereAuth, puedeAdministrarSpa, ctrl.listarHorarioBase);
router.put("/horario-base", requiereAuth, puedeAdministrarSpa, ctrl.guardarHorarioBase);

router.get("/restricciones-ninos", requiereAuth, puedeAdministrarSpa, ctrl.listarRestriccionesNinos);
router.post("/restricciones-ninos", requiereAuth, puedeAdministrarSpa, ctrl.crearRestriccionNinos);
router.delete("/restricciones-ninos/:id", requiereAuth, puedeAdministrarSpa, ctrl.eliminarRestriccionNinos);

module.exports = router;
