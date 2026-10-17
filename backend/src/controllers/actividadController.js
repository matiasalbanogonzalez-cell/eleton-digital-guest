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

const CATEGORIAS = ["KIDS", "ADOLESCENTES", "ADULTOS"];

// Caso 7: crear actividad (recreador o admin)
async function crear(req, res) {
  try {
    const {
      nombre, descripcion, categoria, imagenUrl, fecha, horaInicio, horaFin,
      lugar, edadMinima, edadMaxima, cupoMaximo, instructorId,
    } = req.body;

    // CA09.2: campos obligatorios
    const faltantes = [];
    if (!nombre?.trim()) faltantes.push("nombre");
    if (!descripcion?.trim()) faltantes.push("descripción");
    if (!categoria) faltantes.push("categoría");
    if (!lugar?.trim()) faltantes.push("lugar");
    if (!fecha) faltantes.push("fecha");
    if (!horaInicio) faltantes.push("hora de inicio");
    if (!horaFin) faltantes.push("hora de fin");
    if (edadMinima === "" || edadMinima == null) faltantes.push("edad mínima");
    if (edadMaxima === "" || edadMaxima == null) faltantes.push("edad máxima");
    if (cupoMaximo === "" || cupoMaximo == null) faltantes.push("cupo máximo");
    if (faltantes.length) {
      return res.status(400).json({ error: `Faltan datos obligatorios: ${faltantes.join(", ")}.` });
    }

    // Conversión de tipos (los inputs llegan como texto)
    const cat = String(categoria).toUpperCase();
    const fechaDate = new Date(fecha);
    const min = Number(edadMinima);
    const max = Number(edadMaxima);
    const cupo = Number(cupoMaximo);

    // Validaciones de formato y rango
    if (!CATEGORIAS.includes(cat)) {
      return res.status(400).json({ error: "La categoría no es válida." });
    }
    if (Number.isNaN(fechaDate.getTime())) {
      return res.status(400).json({ error: "La fecha no es válida." });
    }
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
      return res.status(400).json({ error: "El rango de edades no es válido." });
    }
    if (!Number.isInteger(cupo) || cupo < 1) {
      return res.status(400).json({ error: "El cupo máximo debe ser un número mayor a 0." });
    }
    if (horaFin <= horaInicio) {
      return res.status(400).json({ error: "La hora de fin debe ser posterior a la de inicio." });
    }

    // CA09.3 / RN11: no puede repetirse fecha + hora de inicio + categoría + nombre
    const inicioDia = new Date(fechaDate);
    inicioDia.setUTCHours(0, 0, 0, 0);
    const finDia = new Date(inicioDia);
    finDia.setUTCDate(finDia.getUTCDate() + 1);

    const repetida = await prisma.actividad.findFirst({
      where: {
        nombre: nombre.trim(),
        categoria: cat,
        horaInicio,
        fecha: { gte: inicioDia, lt: finDia },
      },
    });
    if (repetida) {
      return res.status(409).json({
        error: "Ya existe una actividad con el mismo nombre, categoría, fecha y hora de inicio.",
      });
    }

    const actividad = await prisma.actividad.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria: cat,
        imagenUrl: imagenUrl || null,
        fecha: fechaDate,
        horaInicio,
        horaFin,
        lugar: lugar.trim(),
        edadMinima: min,
        edadMaxima: max,
        cupoMaximo: cupo,
        instructorId: instructorId || null,
        creadaPorId: req.usuario.id,
      },
      include: { instructor: true, inscripciones: true },
    });

    res.status(201).json(serializar(actividad));
  } catch (err) {
    console.error(err);
    // Violación de unicidad (si el esquema tiene la restricción) o clave foránea
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe una actividad con esos datos." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "El usuario o el instructor indicado no existe. Volvé a iniciar sesión." });
    }
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

// Cancela una o varias reservas desde el panel administrativo sin borrar el historial.
async function cancelarInscripciones(req, res) {
  const ids = [...new Set(req.body?.inscripcionIds || [])];
  if (!Array.isArray(req.body?.inscripcionIds) || ids.length === 0 || ids.some((id) => typeof id !== "string")) {
    return res.status(400).json({ error: "Debés indicar al menos una reserva válida." });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const inscripciones = await tx.inscripcion.findMany({
        where: { id: { in: ids }, estado: { in: ["CONFIRMADA", "LISTA_ESPERA"] } },
        include: { actividad: { select: { id: true, cupoMaximo: true, estado: true } } },
      });

      if (inscripciones.length !== ids.length) {
        const error = new Error("Una o más reservas ya no están activas o no existen.");
        error.status = 404;
        throw error;
      }

      const actividadesAjustar = new Set();
      for (const inscripcion of inscripciones) {
        await tx.inscripcion.update({
          where: { id: inscripcion.id },
          data: { estado: "CANCELADA", asistio: false },
        });

        if (inscripcion.estado === "CONFIRMADA") {
          actividadesAjustar.add(inscripcion.actividadId);
          const siguiente = await tx.inscripcion.findFirst({
            where: {
              actividadId: inscripcion.actividadId,
              estado: "LISTA_ESPERA",
              id: { notIn: ids },
            },
            orderBy: { fechaInscripcion: "asc" },
          });
          if (siguiente) {
            await tx.inscripcion.update({
              where: { id: siguiente.id },
              data: { estado: "CONFIRMADA" },
            });
          }
        }
      }

      for (const actividadId of actividadesAjustar) {
        const actividad = await tx.actividad.findUnique({
          where: { id: actividadId },
          select: { cupoMaximo: true, estado: true },
        });
        const confirmadas = await tx.inscripcion.count({
          where: { actividadId, estado: "CONFIRMADA" },
        });
        if (actividad && actividad.estado !== "CANCELADA" && actividad.estado !== "FINALIZADA") {
          await tx.actividad.update({
            where: { id: actividadId },
            data: { estado: confirmadas >= actividad.cupoMaximo ? "CUPO_LLENO" : "ABIERTA" },
          });
        }
      }

      return { canceladas: inscripciones.length };
    });

    res.json(resultado);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || "Error al cancelar las reservas." });
  }
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
  listar, obtener, crear, editar, cancelar, eliminar, listarParticipantes, cancelarInscripciones, marcarAsistencia,
};
