const { Router } = require("express");
const { registrar, login, yo, logout } = require("../controllers/authController");
const { requiereAuth } = require("../middleware/auth");

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/yo", requiereAuth, yo);
router.post("/logout", requiereAuth, logout);

module.exports = router;
