const { Router } = require("express");
const ctrl = require("../controllers/adminController");
const instructorCtrl = require("../controllers/instructorController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// Solo ADMIN general: es la vista consolidada de toda la operación.
router.get("/dashboard", requiereAuth, requiereRol("ADMIN"), ctrl.dashboard);
router.get("/reservas", requiereAuth, requiereRol("ADMIN"), ctrl.todasLasReservas);

// Gestión de Instructores de Recreación (rol RECREADOR)
router.get("/instructores", requiereAuth, requiereRol("ADMIN"), instructorCtrl.listar);
router.post("/instructores", requiereAuth, requiereRol("ADMIN"), instructorCtrl.crear);
router.put("/instructores/:id", requiereAuth, requiereRol("ADMIN"), instructorCtrl.editar);
router.patch("/instructores/:id/estado", requiereAuth, requiereRol("ADMIN"), instructorCtrl.toggleEstado);
router.delete("/instructores/:id", requiereAuth, requiereRol("ADMIN"), instructorCtrl.eliminar);

module.exports = router;
