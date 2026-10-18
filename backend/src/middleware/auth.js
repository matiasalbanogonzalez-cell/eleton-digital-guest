const { verificarToken } = require("../lib/auth");
const prisma = require("../lib/prisma");

// Extrae el token del header Authorization: Bearer <token> y adjunta el usuario a req.usuario
async function requiereAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado. Falta el token." });
  }

  let payload;
  try {
    payload = verificarToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }

  // Tokens emitidos antes de la revocación por jti no se pueden invalidar
  if (!payload.jti) {
    return res.status(401).json({ error: "Token inválido. Volvé a iniciar sesión." });
  }

  try {
    const revocado = await prisma.tokenRevocado.findUnique({ where: { jti: payload.jti } });
    if (revocado) {
      return res.status(401).json({ error: "Sesión cerrada. Volvé a iniciar sesión." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al validar la sesión." });
  }

  req.usuario = payload; // { id, rol, email, jti, exp }
  next();
}

// Uso: requiereRol("RECREADOR", "ADMIN")
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado." });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tenés permiso para realizar esta acción." });
    }
    next();
  };
}

module.exports = { requiereAuth, requiereRol };
