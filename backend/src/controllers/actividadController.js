const prisma = require("../lib/prisma");

// Convierte una actividad de Prisma (con _count de inscripciones confirmadas)
// al formato que consume el frontend, incluyendo cuposDisponibles calculado.
function serializar(actividad) {
  const inscriptosConfirmados = actividad.inscripciones
    ? actividad.inscripciones.filter((i) => i.estado === "CONFIRMADA").length
    : actividad._count?.inscripciones ?? 0;

  const cuposDisponibles = Math.max(actividad.cupoMaximo - inscriptosConfirmados, 0);

  return {
    id: actividad.id,
    nombre: actividad.nombre,
    descripcion: actividad.descripcion,
    categoria: actividad.categoria,
    imagenUrl: actividad.imagenUrl,
    fecha: actividad.fecha,
    horaInicio: actividad.horaInicio,
    horaFin: actividad.horaFin,
    lugar: actividad.lugar,
    edadMinima: actividad.edadMinima,
    edadMaxima: actividad.edadMaxima,
    cupoMaximo: actividad.cupoMaximo,
    cuposDisponibles,
    estado: actividad.estado,
    instructor: actividad.instructor,
  };
}

// Caso 1 y 2: listar actividades, con filtro opcional por categoría
async function listar(req, res) {
  const { categoria, fecha } = req.query;

  const where = {};
  if (categoria && categoria !== "TODAS") {
    where.categoria = categoria;
  }
  if (fecha) {
    const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
    const finDia = new Date(`${fecha}T00:00:00.000Z`);
    finDia.setUTCDate(finDia.getUTCDate() + 1);
    if (!Number.isNaN(inicioDia.getTime())) where.fecha = { gte: inicioDia, lt: finDia };
  }

  const actividades = await prisma.actividad.findMany({
    where,
    include: { instructor: true, inscripciones: { select: { estado: true } } },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
  });

  res.json(actividades.map(serializar));
}

// Caso 3: ver detalle
async function obtener(req, res) {
  const { id } = req.params;
  const actividad = await prisma.actividad.findUnique({
    where: { id },
    include: { instructor: true, inscripciones: { select: { estado: true } } },
  });

  if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });
  res.json(serializar(actividad));
}

// Caso 7: crear actividad (recreador o admin)
async function crear(req, res) {
  try {
    const {
      nombre, descripcion, categoria, imagenUrl, fecha, horaInicio, horaFin,
      lugar, edadMinima, edadMaxima, cupoMaximo, instructorId,
    } = req.body;

    if (!nombre || !categoria || !fecha || !horaInicio || !lugar || !cupoMaximo) {
      return res.status(400).json({
        error: "nombre, categoria, fecha, horaInicio, lugar y cupoMaximo son obligatorios.",
      });
    }

    const actividad = await prisma.actividad.create({
      data: {
        nombre, descripcion: descripcion || "", categoria, imagenUrl,
        fecha: new Date(fecha), horaInicio, horaFin: horaFin || "",
        lugar, edadMinima: edadMinima ?? 0, edadMaxima: edadMaxima ?? 99,
        cupoMaximo: Number(cupoMaximo), instructorId: instructorId || null,
        creadaPorId: req.usuario.id,
      },
      include: { instructor: true, inscripciones: true },
    });

    res.status(201).json(serializar(actividad));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la actividad." });
  }
}

// Caso 8: editar actividad (solo recreador o admin)
async function editar(req, res) {
  try {
    const { id } = req.params;
    const campos = { ...req.body };
    if (campos.fecha) campos.fecha = new Date(campos.fecha);
    if (campos.cupoMaximo) campos.cupoMaximo = Number(campos.cupoMaximo);
    delete campos.id;

    const actividad = await prisma.actividad.update({
      where: { id },
      data: campos,
      include: { instructor: true, inscripciones: true },
    });

    res.json(serializar(actividad));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al editar la actividad." });
  }
}

// Caso 9 (variante): cancelar actividad, no elimina el registro para conservar historial
async function cancelar(req, res) {
  try {
    const { id } = req.params;
    const actividad = await prisma.actividad.update({
      where: { id },
      data: { estado: "CANCELADA" },
    });
    res.json(serializar({ ...actividad, inscripciones: [] }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cancelar la actividad." });
  }
}

// Solo administrador puede eliminar definitivamente
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    await prisma.inscripcion.deleteMany({ where: { actividadId: id } });
    await prisma.actividad.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la actividad." });
  }
}

// Caso 10: ver lista de inscriptos de una actividad (recreador/admin)
async function listarParticipantes(req, res) {
  const { id } = req.params;
  const inscripciones = await prisma.inscripcion.findMany({
    where: { actividadId: id, estado: { in: ["CONFIRMADA", "LISTA_ESPERA"] } },
    include: { usuario: { select: { id: true, nombre: true, apellido: true, habitacion: true, telefono: true } } },
    orderBy: { fechaInscripcion: "asc" },
  });
  res.json(inscripciones);
}

// Caso 11: marcar asistencia (recreador/admin)
async function marcarAsistencia(req, res) {
  const { inscripcionId } = req.params;
  const { asistio } = req.body;
  try {
    const inscripcion = await prisma.inscripcion.update({
      where: { id: inscripcionId },
      data: { asistio: Boolean(asistio) },
    });
    res.json(inscripcion);
  } catch (err) {
    res.status(500).json({ error: "Error al marcar asistencia." });
  }
}

module.exports = {
  listar, obtener, crear, editar, cancelar, eliminar, listarParticipantes, marcarAsistencia,
};
