const prisma = require("../lib/prisma");

// =========================
// PÚBLICO
// =========================

// El huésped ve un aviso si: está activo, hoy cae en su rango de fechas, y
// (no tiene zonas asignadas -> es para todos) o (su habitación pertenece a
// alguna de las zonas del aviso).
async function listarAvisosPublicos(req, res) {
  const { habitacion, seccion } = req.query;
  const ahora = new Date();

  const avisos = await prisma.aviso.findMany({
    where: {
      activo: true,
      fechaInicio: { lte: ahora },
      fechaFin: { gte: ahora },
      ...(seccion ? { OR: [{ seccionAfectada: null }, { seccionAfectada: seccion }] } : {}),
    },
    include: { zonas: true },
    orderBy: [{ prioridad: "desc" }, { createdAt: "desc" }],
  });

  const visibles = avisos.filter((aviso) => {
    if (aviso.zonas.length === 0) return true;
    if (!habitacion) return false;
    return aviso.zonas.some((z) => z.habitaciones.includes(habitacion));
  });

  res.json(visibles.map(({ zonas, ...resto }) => ({ ...resto, zonas: zonas.map((z) => z.nombre) })));
}

async function listarZonas(req, res) {
  const zonas = await prisma.zonaHotel.findMany({ orderBy: { nombre: "asc" } });
  res.json(zonas);
}

// =========================
// ADMIN
// =========================

async function listarAvisosAdmin(req, res) {
  const avisos = await prisma.aviso.findMany({
    include: { zonas: true, creadoPor: { select: { nombre: true, apellido: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(avisos);
}

async function crearAviso(req, res) {
  const { titulo, mensaje, fechaInicio, fechaFin, prioridad, seccionAfectada, zonaIds } = req.body;

  if (!titulo || !mensaje || !fechaInicio || !fechaFin) {
    return res.status(400).json({ error: "titulo, mensaje, fechaInicio y fechaFin son obligatorios." });
  }

  const aviso = await prisma.aviso.create({
    data: {
      titulo,
      mensaje,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      prioridad: prioridad || "MEDIA",
      seccionAfectada: seccionAfectada || null,
      creadoPorId: req.usuario.id,
      zonas: zonaIds && zonaIds.length ? { connect: zonaIds.map((id) => ({ id })) } : undefined,
    },
    include: { zonas: true },
  });

  res.status(201).json(aviso);
}

async function editarAviso(req, res) {
  const { id } = req.params;
  const { titulo, mensaje, fechaInicio, fechaFin, prioridad, seccionAfectada, zonaIds } = req.body;

  try {
    const aviso = await prisma.aviso.update({
      where: { id },
      data: {
        ...(titulo !== undefined ? { titulo } : {}),
        ...(mensaje !== undefined ? { mensaje } : {}),
        ...(fechaInicio !== undefined ? { fechaInicio: new Date(fechaInicio) } : {}),
        ...(fechaFin !== undefined ? { fechaFin: new Date(fechaFin) } : {}),
        ...(prioridad !== undefined ? { prioridad } : {}),
        ...(seccionAfectada !== undefined ? { seccionAfectada: seccionAfectada || null } : {}),
        ...(zonaIds !== undefined ? { zonas: { set: zonaIds.map((zid) => ({ id: zid })) } } : {}),
      },
      include: { zonas: true },
    });
    res.json(aviso);
  } catch (err) {
    res.status(404).json({ error: "Aviso no encontrado." });
  }
}

async function toggleActivoAviso(req, res) {
  const { id } = req.params;
  const aviso = await prisma.aviso.findUnique({ where: { id } });
  if (!aviso) return res.status(404).json({ error: "Aviso no encontrado." });

  const actualizado = await prisma.aviso.update({
    where: { id },
    data: { activo: !aviso.activo },
  });
  res.json(actualizado);
}

async function eliminarAviso(req, res) {
  const { id } = req.params;
  try {
    await prisma.aviso.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: "Aviso no encontrado." });
  }
}

module.exports = {
  listarAvisosPublicos,
  listarZonas,
  listarAvisosAdmin,
  crearAviso,
  editarAviso,
  toggleActivoAviso,
  eliminarAviso,
};
