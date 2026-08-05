const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar";
const JWT_EXPIRES_IN = "7d";

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol, email: usuario.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function hashearPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { firmarToken, verificarToken, hashearPassword, compararPassword };
