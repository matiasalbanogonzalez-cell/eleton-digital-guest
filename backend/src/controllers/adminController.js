const prisma = require("../lib/prisma");

function inicioDia(fechaStr) {
  return new Date(`${fechaStr}T00:00:00.000Z`);
}

// Resumen general del día: números de las 4 áreas + avisos activos.
// Solo ADMIN general — es la vista de "toda la operación".
async function dashboard(req, res) {
  const fechaQuery = req.query.fecha || new Date().toISOString().slice(0, 10);
  const fechaDia = inicioDia(fechaQuery);
  const ahora = new Date();

  const [reservasResto, inscripcionesRecreacion, reservasSpa, reservasTeatro, avisosActivos] = await Promise.all([
    prisma.reservaResto.findMany({ where: { fecha: fechaDia, estado: "CONFIRMADA" } }),
    prisma.inscripcion.findMany({
      where: { estado: "CONFIRMADA", actividad: { fecha: fechaDia } },
    }),
    prisma.reservaSpa.findMany({
      where: { estado: "CONFIRMADA", turno: { fecha: fechaDia } },
    }),
    prisma.reservaTeatro.findMany({
      where: { estado: "CONFIRMADA", funcion: { fecha: fechaDia } },
    }),
    prisma.aviso.count({
      where: { activo: true, fechaInicio: { lte: ahora }, fechaFin: { gte: ahora } },
    }),
  ]);

  res.json({
    fecha: fechaQuery,
    resto: { reservas: reservasResto.length, personas: reservasResto.reduce((a, r) => a + r.personas, 0) },
    recreacion: { inscriptos: inscripcionesRecreacion.length },
    spa: {
      reservas: reservasSpa.length,
      personas: reservasSpa.reduce((a, r) => a + r.personasAdultos + r.personasNinos, 0),
    },
    teatro: { reservas: reservasTeatro.length, personas: reservasTeatro.reduce((a, r) => a + r.personas, 0) },
    avisosActivos,
  });
}

// Vista unificada de solo lectura: une Restó + Recreación + Spa + Teatro en
// una forma común, sin crear una tabla "Reserva" genérica.
async function todasLasReservas(req, res) {
  const { area, fecha, estado, habitacion } = req.query;
  const fechaDia = fecha ? inicioDia(fecha) : undefined;

  const resultado = [];

  if (!area || area === "resto") {
    const reservas = await prisma.reservaResto.findMany({
      where: { ...(fechaDia ? { fecha: fechaDia } : {}), ...(estado ? { estado } : {}), ...(habitacion ? { habitacion } : {}) },
      include: { servicio: true, horario: true },
    });
    resultado.push(
      ...reservas.map((r) => ({
        area: "resto",
        idOriginal: r.id,
        fecha: r.fecha,
        huesped: r.nombre,
        habitacion: r.habitacion,
        servicio: r.servicio.nombre,
        horario: r.horario?.hora || null,
        personas: r.personas,
        estado: r.estado,
      }))
    );
  }

  if (!area || area === "recreacion") {
    const inscripciones = await prisma.inscripcion.findMany({
      where: {
        ...(fechaDia ? { actividad: { fecha: fechaDia } } : {}),
        ...(estado ? { estado } : {}),
      },
      include: { actividad: true, usuario: true },
    });
    resultado.push(
      ...inscripciones
        .filter((i) => !habitacion || i.usuario.habitacion === habitacion)
        .map((i) => ({
          area: "recreacion",
          idOriginal: i.id,
          fecha: i.actividad.fecha,
          huesped: `${i.usuario.nombre} ${i.usuario.apellido || ""}`.trim(),
          habitacion: i.usuario.habitacion || "",
          servicio: i.actividad.nombre,
          horario: i.actividad.horaInicio,
          personas: 1,
          estado: i.estado,
        }))
    );
  }

  if (!area || area === "spa") {
    const reservas = await prisma.reservaSpa.findMany({
      where: { ...(fechaDia ? { turno: { fecha: fechaDia } } : {}), ...(estado ? { estado } : {}), ...(habitacion ? { habitacion } : {}) },
      include: { turno: true },
    });
    resultado.push(
      ...reservas.map((r) => ({
        area: "spa",
        idOriginal: r.id,
        fecha: r.turno.fecha,
        huesped: r.nombre,
        habitacion: r.habitacion,
        servicio: "Circuito Hídrico",
        horario: r.turno.horaInicio,
        personas: r.personasAdultos + r.personasNinos,
        estado: r.estado,
      }))
    );
  }

  if (!area || area === "teatro") {
    const reservas = await prisma.reservaTeatro.findMany({
      where: { ...(fechaDia ? { funcion: { fecha: fechaDia } } : {}), ...(estado ? { estado } : {}), ...(habitacion ? { habitacion } : {}) },
      include: { funcion: true },
    });
    resultado.push(
      ...reservas.map((r) => ({
        area: "teatro",
        idOriginal: r.id,
        fecha: r.funcion.fecha,
        huesped: r.nombre,
        habitacion: r.habitacion,
        servicio: r.funcion.espectaculo,
        horario: r.funcion.hora,
        personas: r.personas,
        estado: r.estado,
      }))
    );
  }

  resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(resultado);
}

module.exports = { dashboard, todasLasReservas };
