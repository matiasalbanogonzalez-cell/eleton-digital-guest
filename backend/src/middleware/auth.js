const { verificarToken } = require("../lib/auth");

// Extrae el token del header Authorization: Bearer <token> y adjunta el usuario a req.usuario
function requiereAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado. Falta el token." });
  }

  try {
    const payload = verificarToken(token);
    req.usuario = payload; // { id, rol, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
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
