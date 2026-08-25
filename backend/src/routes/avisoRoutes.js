const { Router } = require("express");
const ctrl = require("../controllers/avisoController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// --- Público ---
router.get("/", ctrl.listarAvisosPublicos);
router.get("/zonas", ctrl.listarZonas);

// --- Admin (solo ADMIN general — avisos no está acotado a un rol de área) ---
router.get("/admin", requiereAuth, requiereRol("ADMIN"), ctrl.listarAvisosAdmin);
router.post("/admin", requiereAuth, requiereRol("ADMIN"), ctrl.crearAviso);
router.put("/admin/:id", requiereAuth, requiereRol("ADMIN"), ctrl.editarAviso);
router.patch("/admin/:id/estado", requiereAuth, requiereRol("ADMIN"), ctrl.toggleActivoAviso);
router.delete("/admin/:id", requiereAuth, requiereRol("ADMIN"), ctrl.eliminarAviso);

module.exports = router;
