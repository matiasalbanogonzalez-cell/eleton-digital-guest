const { Router } = require("express");
const ctrl = require("../controllers/adminController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// Solo ADMIN general: es la vista consolidada de toda la operación.
router.get("/dashboard", requiereAuth, requiereRol("ADMIN"), ctrl.dashboard);
router.get("/reservas", requiereAuth, requiereRol("ADMIN"), ctrl.todasLasReservas);

module.exports = router;
