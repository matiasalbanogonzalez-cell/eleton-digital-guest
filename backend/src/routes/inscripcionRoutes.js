const { Router } = require("express");
const ctrl = require("../controllers/inscripcionController");
const { requiereAuth } = require("../middleware/auth");

const router = Router();

router.get("/mias", requiereAuth, ctrl.misActividades);
router.post("/", ctrl.inscribirse);
router.delete("/:actividadId", requiereAuth, ctrl.cancelarInscripcion);

module.exports = router;
