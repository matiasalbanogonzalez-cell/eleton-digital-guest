const prisma = require("../lib/prisma");

// Estados de actividad que ya no cuentan como "futuras"
const ESTADOS_NO_FUTUROS = ["CANCELADA", "FINALIZADA"];

function inicioDeHoy() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Busca otro instructor ACTIVO con el mismo correo o con el mismo nombre y apellido.
// Devuelve el mensaje de error o null si no hay conflicto.
async function buscarDuplicadoActivo({ nombre, apellido, email, excluirId }) {
  const base = { activo: true, ...(excluirId ? { NOT: { id: excluirId } } : {}) };

  if (email) {
    const porEmail = await prisma.instructor.findFirst({
      where: { ...base, email: { equals: email, mode: "insensitive" } },
    });
    if (porEmail) return "Ya existe un instructor activo registrado con ese correo electrónico.";
  }

  const porNombre = await prisma.instructor.findFirst({
    where: {
      ...base,
      nombre: { equals: nombre, mode: "insensitive" },
      apellido: { equals: apellido, mode: "insensitive" },
    },
  });
  if (porNombre) return "Ya existe un instructor activo con ese nombre y apellido.";

  return null;
}

// Listar todos los instructores (entidad Instructor)
// Nombre y apellido: solo letras y espacios (máx. 40). Teléfono: solo números (9 a 15).
function validarNombreYTelefono({ nombre, apellido, telefono }) {
  const soloLetras = /^[\p{L} ]+$/u;
  if (nombre !== undefined && nombre !== null && nombre.trim() && (!soloLetras.test(nombre.trim()) || nombre.trim().length > 40)) {
    return "El nombre solo puede tener letras (máximo 40 caracteres).";
  }
  if (apellido !== undefined && apellido !== null && apellido.trim() && (!soloLetras.test(apellido.trim()) || apellido.trim().length > 40)) {
    return "El apellido solo puede tener letras (máximo 40 caracteres).";
  }
  if (telefono && !/^\d{9,15}$/.test(String(telefono).trim())) {
    return "El teléfono solo puede tener números, entre 9 y 15 dígitos.";
  }
  return null;
}

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

    const errorFormato = validarNombreYTelefono({ nombre, apellido, telefono });
    if (errorFormato) return res.status(400).json({ error: errorFormato });

    const emailNormalizado = email?.trim() ? email.trim().toLowerCase() : null;
    if (emailNormalizado) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailNormalizado)) {
        return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
      }
    }

    const duplicado = await buscarDuplicadoActivo({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: emailNormalizado,
    });
    if (duplicado) {
      return res.status(409).json({ error: duplicado });
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

    const errorFormato = validarNombreYTelefono({ nombre, apellido, telefono });
    if (errorFormato) return res.status(400).json({ error: errorFormato });

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
      }
      datosActualizar.email = emailNormalizado;
    }

    if (telefono !== undefined) {
      datosActualizar.telefono = telefono ? telefono.trim() : null;
    }

    if (activo !== undefined) {
      datosActualizar.activo = Boolean(activo);
    }

    // Si el instructor queda activo, no puede coincidir con otro instructor activo
    const quedaActivo = datosActualizar.activo !== undefined ? datosActualizar.activo : actual.activo;
    if (quedaActivo) {
      const duplicado = await buscarDuplicadoActivo({
        nombre: datosActualizar.nombre ?? actual.nombre,
        apellido: datosActualizar.apellido ?? actual.apellido,
        email: datosActualizar.email !== undefined ? datosActualizar.email : actual.email,
        excluirId: id,
      });
      if (duplicado) {
        return res.status(409).json({ error: duplicado });
      }
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

    // Al reactivar, no puede coincidir con otro instructor activo
    if (nuevoEstado) {
      const duplicado = await buscarDuplicadoActivo({
        nombre: actual.nombre,
        apellido: actual.apellido,
        email: actual.email,
        excluirId: id,
      });
      if (duplicado) {
        return res.status(409).json({ error: duplicado });
      }
    }

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

// Cantidad de actividades futuras (no canceladas ni finalizadas) del instructor.
// El frontend lo usa para advertir antes de desactivar.
async function actividadesFuturas(req, res) {
  try {
    const { id } = req.params;
    const instructor = await prisma.instructor.findUnique({ where: { id } });
    if (!instructor) {
      return res.status(404).json({ error: "Instructor no encontrado." });
    }

    const cantidad = await prisma.actividad.count({
      where: {
        instructorId: id,
        fecha: { gte: inicioDeHoy() },
        estado: { notIn: ESTADOS_NO_FUTUROS },
      },
    });

    res.json({ cantidad });
  } catch (err) {
    console.error("Error al contar actividades futuras:", err);
    res.status(500).json({ error: "Error al consultar las actividades del instructor." });
  }
}

// Solo instructores activos: es lo que se ofrece al crear o editar una actividad.
async function listarActivos(req, res) {
  try {
    const instructores = await prisma.instructor.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true },
      orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
    });
    res.json(instructores);
  } catch (err) {
    console.error("Error al listar instructores activos:", err);
    res.status(500).json({ error: "Error al obtener los instructores activos." });
  }
}

module.exports = {
  actividadesFuturas,
  listarActivos,
  listar,
  crear,
  editar,
  toggleEstado,
  eliminar,
};