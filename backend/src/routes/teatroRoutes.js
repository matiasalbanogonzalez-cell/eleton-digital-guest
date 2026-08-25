const { Router } = require("express");
const ctrl = require("../controllers/teatroController");
const { requiereAuth, requiereRol } = require("../middleware/auth");

const router = Router();

// --- Público ---
router.get("/funciones", ctrl.listarFunciones);
router.post("/reservas", ctrl.crearReserva);

// --- Administración del Teatro (ADMIN o ADMIN_TEATRO) ---
const puedeAdministrarTeatro = requiereRol("ADMIN", "ADMIN_TEATRO");

router.get("/panel", requiereAuth, puedeAdministrarTeatro, ctrl.panelResumen);
router.get("/reservas", requiereAuth, puedeAdministrarTeatro, ctrl.listarReservas);
router.patch("/reservas/:id/cancelar", requiereAuth, puedeAdministrarTeatro, ctrl.cancelarReserva);

router.get("/formatos", requiereAuth, puedeAdministrarTeatro, ctrl.listarFormatosAdmin);
router.post("/formatos", requiereAuth, puedeAdministrarTeatro, ctrl.crearFormato);
router.put("/formatos/:id", requiereAuth, puedeAdministrarTeatro, ctrl.editarFormato);

router.get("/admin/funciones", requiereAuth, puedeAdministrarTeatro, ctrl.listarFuncionesAdmin);
router.post("/admin/funciones", requiereAuth, puedeAdministrarTeatro, ctrl.crearFuncion);
router.put("/admin/funciones/:id", requiereAuth, puedeAdministrarTeatro, ctrl.editarFuncion);

module.exports = router;
