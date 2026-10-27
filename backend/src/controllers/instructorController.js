const prisma = require("../lib/prisma");

// Listar todos los instructores (entidad Instructor)
async function listar(req, res) {
  try {
    const instructores = await prisma.instructor.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
        _count: {
          select: { actividades: true },
        },
      },
      orderBy: [{ activo: "desc" }, { nombre: "asc" }, { apellido: "asc" }],
    });

    const resultado = instructores.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      apellido: i.apellido,
      email: i.email,
      telefono: i.telefono,
      activo: i.activo,
      creadoEn: i.creadoEn,
      actualizadoEn: i.actualizadoEn,
      actividadesAsignadas: i._count.actividades,
      totalActividades: i._count.actividades,
    }));

    res.json(resultado);
  } catch (err) {
    console.error("Error al listar instructores:", err);
    res.status(500).json({ error: "Error al obtener la lista de instructores." });
  }
}

// Dar de alta un instructor en la tabla instructores
async function crear(req, res) {
  try {
    const { nombre, apellido, email, telefono } = req.body;

    if (!nombre?.trim() || !apellido?.trim()) {
      return res.status(400).json({
        error: "Nombre y apellido son obligatorios.",
      });
    }

    const emailNormalizado = email?.trim() ? email.trim().toLowerCase() : null;
    if (emailNormalizado) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalizado)) {
        return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
      }

      const existente = await prisma.instructor.findFirst({
        where: { email: emailNormalizado },
      });
      if (existente) {
        return res.status(409).json({ error: "Ya existe un instructor registrado con ese correo electrónico." });
      }
    }

    const instructor = await prisma.instructor.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        telefono: telefono?.trim() || null,
        activo: true,
      },
    });

    res.status(201).json({
      id: instructor.id,
      nombre: instructor.nombre,
      apellido: instructor.apellido,
      email: instructor.email,
      telefono: instructor.telefono,
      activo: instructor.activo,
      creadoEn: instructor.creadoEn,
      actualizadoEn: instructor.actualizadoEn,
      actividadesAsignadas: 0,
      totalActividades: 0,
    });
  } catch (err) {
    console.error("Error al crear instructor:", err);
    res.status(500).json({ error: "Error al dar de alta el instructor." });
  }
}

// Modificar datos de un instructor existente
async function editar(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, activo } = req.body;

    const actual = await prisma.instructor.findUnique({ where: { id } });
    if (!actual) {
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
      const emailNormalizado = email?.trim() ? email.trim().toLowerCase() : null;
      if (emailNormalizado) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailNormalizado)) {
          return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
        }

        if (emailNormalizado !== actual.email) {
          const enUso = await prisma.instructor.findFirst({
            where: { email: emailNormalizado, NOT: { id } },
          });
          if (enUso) {
            return res.status(409).json({ error: "Ya existe otro instructor con ese correo electrónico." });
          }
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

    const actualizado = await prisma.instructor.update({
      where: { id },
      data: datosActualizar,
      include: {
        _count: { select: { actividades: true } },
      },
    });

    res.json({
      id: actualizado.id,
      nombre: actualizado.nombre,
      apellido: actualizado.apellido,
      email: actualizado.email,
      telefono: actualizado.telefono,
      activo: actualizado.activo,
      creadoEn: actualizado.creadoEn,
      actualizadoEn: actualizado.actualizadoEn,
      actividadesAsignadas: actualizado._count.actividades,
      totalActividades: actualizado._count.actividades,
    });
  } catch (err) {
    console.error("Error al editar instructor:", err);
    res.status(500).json({ error: "Error al actualizar los datos del instructor." });
  }
}

// Activar o desactivar instructor (Baja Lógica directa en modelo Instructor)
async function toggleEstado(req, res) {
  try {
    const { id } = req.params;

    const actual = await prisma.instructor.findUnique({ where: { id } });
    if (!actual) {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    const nuevoEstado = !actual.activo;

    const actualizado = await prisma.instructor.update({
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

// Eliminar instructor:
// Si tiene actividades asignadas, se bloquea la eliminación física para no romper el histórico
// y se orienta a la baja lógica (Desactivar).
// Si no tiene actividades asignadas, se permite la eliminación definitiva.
async function eliminar(req, res) {
  try {
    const { id } = req.params;

    const actual = await prisma.instructor.findUnique({
      where: { id },
      include: {
        _count: { select: { actividades: true } },
      },
    });

    if (!actual) {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    const totalActividades = actual._count.actividades;

    if (totalActividades > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el instructor porque tiene ${totalActividades} actividad(es) asignada(s). Para preservar el histórico de recreación, utilizá la opción "Desactivar" (baja lógica).`,
      });
    }

    await prisma.instructor.delete({ where: { id } });

    res.json({
      ok: true,
      mensaje: `El instructor ${actual.nombre} ${actual.apellido} fue eliminado correctamente.`,
    });
  } catch (err) {
    console.error("Error al eliminar instructor:", err);
    res.status(500).json({
      error: "No se pudo eliminar el instructor. Podés desactivarlo en su lugar.",
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
