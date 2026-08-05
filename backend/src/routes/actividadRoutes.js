const { Router } = require("express");
const ctrl = require("../controllers/actividadController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// Páginas públicas de actividades
router.get("/", ctrl.listar);
router.get("/:id", ctrl.obtener);

// Solo recreador o admin (Casos 7, 8, 9, 10, 11)
router.post("/", requiereAuth, requiereRol("RECREADOR", "ADMIN"), ctrl.crear);
router.put("/:id", requiereAuth, requiereRol("RECREADOR", "ADMIN"), ctrl.editar);
router.post("/:id/cancelar", requiereAuth, requiereRol("RECREADOR", "ADMIN"), ctrl.cancelar);
router.get("/:id/participantes", requiereAuth, requiereRol("RECREADOR", "ADMIN"), ctrl.listarParticipantes);
router.patch("/inscripciones/:inscripcionId/asistencia", requiereAuth, requiereRol("RECREADOR", "ADMIN"), ctrl.marcarAsistencia);

// Solo admin (regla de negocio: solo el administrador puede eliminar actividades)
router.delete("/:id", requiereAuth, requiereRol("ADMIN"), ctrl.eliminar);

module.exports = router;
