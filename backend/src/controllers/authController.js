const prisma = require("../lib/prisma");
const { firmarToken, hashearPassword, compararPassword } = require("../lib/auth");

function usuarioPublico(usuario) {
  const { passwordHash, ...resto } = usuario;
  return resto;
}

async function registrar(req, res) {
  try {
    const { nombre, apellido, email, password, habitacion, telefono } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ error: "nombre, apellido, email y password son obligatorios." });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
    }

    const passwordHash = await hashearPassword(password);

    const usuario = await prisma.usuario.create({
      data: { nombre, apellido, email, passwordHash, habitacion, telefono, rol: "HUESPED" },
    });

    const token = firmarToken(usuario);
    res.status(201).json({ token, usuario: usuarioPublico(usuario) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios." });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const ok = await compararPassword(password, usuario.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ error: "Esta cuenta se encuentra desactivada. Contactá con el administrador." });
    }

    const token = firmarToken(usuario);
    res.json({ token, usuario: usuarioPublico(usuario) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
}

async function yo(req, res) {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json({ usuario: usuarioPublico(usuario) });
}

async function logout(req, res) {
  const { jti, exp, id } = req.usuario;

  try {
    await prisma.tokenRevocado.upsert({
      where: { jti },
      update: {},
      create: { jti, usuarioId: id, expiraEn: new Date(exp * 1000) },
    });

    // Limpieza oportunista: los revocados ya vencidos no aportan nada
    await prisma.tokenRevocado.deleteMany({ where: { expiraEn: { lt: new Date() } } });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
}

module.exports = { registrar, login, yo, logout };
