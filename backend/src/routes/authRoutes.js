const { Router } = require("express");
const { registrar, login, yo } = require("../controllers/authController");
const { requiereAuth } = require("../middleware/auth");

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/yo", requiereAuth, yo);

module.exports = router;
