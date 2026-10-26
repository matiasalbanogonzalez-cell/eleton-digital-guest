const prisma = require("../lib/prisma");
const { hashearPassword } = require("../lib/auth");

function sanitizarUsuario(usuario) {
  const { passwordHash, ...resto } = usuario;
  return resto;
}

// Listar todos los instructores (rol RECREADOR)
async function listar(req, res) {
  try {
    const instructores = await prisma.usuario.findMany({
      where: { rol: "RECREADOR" },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        activo: true,
        creadoEn: true,
        _count: {
          select: { actividadesCreadas: true },
        },
      },
      orderBy: [{ activo: "desc" }, { nombre: "asc" }, { apellido: "asc" }],
    });

    const resultado = instructores.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      activo: u.activo,
      creadoEn: u.creadoEn,
      totalActividades: u._count.actividadesCreadas,
    }));

    res.json(resultado);
  } catch (err) {
    console.error("Error al listar instructores:", err);
    res.status(500).json({ error: "Error al obtener la lista de instructores." });
  }
}

// Dar de alta un instructor (rol RECREADOR)
async function crear(req, res) {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Nombre, apellido, correo electrónico y contraseña son obligatorios.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalizado)) {
      return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });
    if (existente) {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo electrónico." });
    }

    const passwordHash = await hashearPassword(password);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        passwordHash,
        telefono: telefono?.trim() || null,
        rol: "RECREADOR",
        activo: true,
      },
    });

    // Sincronizar con el modelo Instructor si existe para consistencia con Actividades
    try {
      const instructorExistente = await prisma.instructor.findFirst({
        where: { email: emailNormalizado },
      });
      if (!instructorExistente) {
        await prisma.instructor.create({
          data: {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNormalizado,
            telefono: telefono?.trim() || null,
          },
        });
      } else {
        await prisma.instructor.update({
          where: { id: instructorExistente.id },
          data: {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono?.trim() || null,
          },
        });
      }
    } catch (e) {
      console.warn("Aviso: no se pudo sincronizar tabla instructores:", e.message);
    }

    res.status(201).json(sanitizarUsuario(usuario));
  } catch (err) {
    console.error("Error al crear instructor:", err);
    res.status(500).json({ error: "Error al dar de alta el instructor." });
  }
}

// Modificar datos de un instructor existente
async function editar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, telefono, activo } = req.body;

    const actual = await prisma.usuario.findUnique({ where: { id } });
    if (!actual || actual.rol !== "RECREADOR") {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    const datosActualizar = {};

    if (nombre !== undefined) {
      if (!nombre.trim()) return res.status(400).json({ error: "El nombre no puede estar vacío." });
      datosActualizar.nombre = nombre.trim();
    }

    if (apellido !== undefined) {
      if (!apellido.trim()) return res.status(400).json({ error: "El apellido no puede estar vacío." });
      datosActualizar.apellido = apellido.trim();
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalizado)) {
        return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
      }

      if (emailNormalizado !== actual.email) {
        const enUso = await prisma.usuario.findFirst({
          where: { email: emailNormalizado, NOT: { id } },
        });
        if (enUso) {
          return res.status(409).json({ error: "Ya existe otro usuario con ese correo electrónico." });
        }
      }
      datosActualizar.email = emailNormalizado;
    }

    if (telefono !== undefined) {
      datosActualizar.telefono = telefono ? telefono.trim() : null;
    }

    if (activo !== undefined) {
      datosActualizar.activo = Boolean(activo);
    }

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
      }
      datosActualizar.passwordHash = await hashearPassword(password);
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: datosActualizar,
    });

    // Sincronizar tabla instructores
    try {
      const emailABuscar = actual.email;
      const instRecord = await prisma.instructor.findFirst({
        where: { email: emailABuscar },
      });
      if (instRecord) {
        await prisma.instructor.update({
          where: { id: instRecord.id },
          data: {
            nombre: actualizado.nombre,
            apellido: actualizado.apellido,
            email: actualizado.email,
            telefono: actualizado.telefono,
          },
        });
      }
    } catch (e) {
      console.warn("Aviso: no se pudo sincronizar tabla instructores en edición:", e.message);
    }

    res.json(sanitizarUsuario(actualizado));
  } catch (err) {
    console.error("Error al editar instructor:", err);
    res.status(500).json({ error: "Error al actualizar los datos del instructor." });
  }
}

// Activar o desactivar instructor
async function toggleEstado(req, res) {
  try {
    const { id } = req.params;

    const actual = await prisma.usuario.findUnique({ where: { id } });
    if (!actual || actual.rol !== "RECREADOR") {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    const nuevoEstado = !actual.activo;

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { activo: nuevoEstado },
    });

    res.json({
      ok: true,
      id: actualizado.id,
      activo: actualizado.activo,
      mensaje: nuevoEstado
        ? `El instructor ${actualizado.nombre} ${actualizado.apellido} ha sido activado.`
        : `El instructor ${actualizado.nombre} ${actualizado.apellido} ha sido desactivado.`,
    });
  } catch (err) {
    console.error("Error al cambiar estado del instructor:", err);
    res.status(500).json({ error: "Error al modificar el estado del instructor." });
  }
}

// Dar de baja definitiva de forma segura
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    if (req.usuario.id === id) {
      return res.status(400).json({ error: "No podés eliminar tu propia cuenta de usuario." });
    }

    const actual = await prisma.usuario.findUnique({ where: { id } });
    if (!actual || actual.rol !== "RECREADOR") {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revocar tokens de sesión
      await tx.tokenRevocado.deleteMany({ where: { usuarioId: id } });

      // 2. Si tenía inscripciones como huésped, removerlas
      await tx.inscripcion.deleteMany({ where: { usuarioId: id } });

      // 3. Desvincular de actividades creadas (creadaPorId pasa a null)
      await tx.actividad.updateMany({
        where: { creadaPorId: id },
        data: { creadaPorId: null },
      });

      // 4. Si existe registro en tabla 'instructores', desvincular de actividades y eliminarlo
      const instRecord = await tx.instructor.findFirst({
        where: { email: actual.email },
      });
      if (instRecord) {
        await tx.actividad.updateMany({
          where: { instructorId: instRecord.id },
          data: { instructorId: null },
        });
        await tx.instructor.delete({ where: { id: instRecord.id } });
      }

      // 5. Eliminar usuario
      await tx.usuario.delete({ where: { id } });
    });

    res.json({
      ok: true,
      mensaje: `El instructor ${actual.nombre} ${actual.apellido} fue eliminado de forma segura.`,
    });
  } catch (err) {
    console.error("Error al eliminar instructor:", err);
    res.status(500).json({
      error:
        "No se pudo eliminar el instructor debido a dependencias activas. Podés desactivarlo en su lugar.",
    });
  }
}

module.exports = {
  listar,
  crear,
  editar,
  toggleEstado,
  eliminar,
};
