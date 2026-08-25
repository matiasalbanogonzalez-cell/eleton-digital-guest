const prisma = require("../lib/prisma");

function inicioDia(fechaStr) {
  return new Date(`${fechaStr}T00:00:00.000Z`);
}

// Resuelve el horario real de apertura/cierre para una fecha: si cae dentro de
// una TemporadaSpa activa, usa esa; si no, usa el HorarioBaseSpa del día de la
// semana correspondiente. Nada hardcodeado — todo sale de la base.
async function resolverHorarioDelDia(fecha) {
  const fechaDia = inicioDia(fecha);

  const temporada = await prisma.temporadaSpa.findFirst({
    where: { activo: true, fechaInicio: { lte: fechaDia }, fechaFin: { gte: fechaDia } },
  });
  if (temporada) return { horaApertura: temporada.horaApertura, horaCierre: temporada.horaCierre, temporada: temporada.nombre };

  const diaSemana = new Date(`${fecha}T12:00:00.000Z`).getUTCDay();
  const base = await prisma.horarioBaseSpa.findUnique({ where: { diaSemana } });
  if (!base) return null;

  return { horaApertura: base.horaApertura, horaCierre: base.horaCierre, temporada: null };
}

// Genera bloques de 1 hora entre apertura y cierre: ["09:00","10:00",...]
function generarBloques(horaApertura, horaCierre) {
  const [hIni] = horaApertura.split(":").map(Number);
  const [hFin] = horaCierre.split(":").map(Number);
  const bloques = [];
  for (let h = hIni; h < hFin; h++) {
    const pad = (n) => String(n).padStart(2, "0");
    bloques.push({ horaInicio: `${pad(h)}:00`, horaFin: `${pad(h + 1)}:00` });
  }
  return bloques;
}

async function permiteNinosEnBloque(horaInicio) {
  const restricciones = await prisma.restriccionNinosSpa.findMany({ where: { activo: true } });
  if (restricciones.length === 0) return true; // sin restricciones configuradas = sin límite
  return restricciones.some((r) => horaInicio >= r.horaInicio && horaInicio < r.horaFin);
}

// Devuelve { capacidadMaxima, ocupadas } para un bloque puntual, considerando
// que puede no existir todavía una fila de TurnoSpa (si nunca se reservó).
async function estadoBloque(tx, fecha, horaInicio) {
  const fechaDia = inicioDia(fecha);
  const turno = await tx.turnoSpa.findUnique({ where: { fecha_horaInicio: { fecha: fechaDia, horaInicio } } });

  if (!turno) return { turno: null, capacidadMaxima: 25, ocupadas: 0 };

  const reservas = await tx.reservaSpa.findMany({ where: { turnoId: turno.id, estado: "CONFIRMADA" } });
  const ocupadas = reservas.reduce((acc, r) => acc + r.personasAdultos + r.personasNinos, 0);
  return { turno, capacidadMaxima: turno.capacidadMaxima, ocupadas };
}

// =========================
// PÚBLICO
// =========================

async function listarHorariosDisponibles(req, res) {
  const { fecha, personasAdultos, personasNinos } = req.query;
  if (!fecha) return res.status(400).json({ error: "fecha es obligatoria." });

  const adultos = Number(personasAdultos || 1);
  const ninos = Number(personasNinos || 0);
  const totalPersonas = adultos + ninos;

  const horario = await resolverHorarioDelDia(fecha);
  if (!horario) return res.json({ bloques: [] });

  const bloques = generarBloques(horario.horaApertura, horario.horaCierre);

  const resultado = [];
  for (const bloque of bloques) {
    if (ninos > 0) {
      const permitido = await permiteNinosEnBloque(bloque.horaInicio);
      if (!permitido) continue; // se oculta, no se muestra y se rechaza
    }

    const { capacidadMaxima, ocupadas } = await estadoBloque(prisma, fecha, bloque.horaInicio);
    const lugaresDisponibles = Math.max(0, capacidadMaxima - ocupadas);

    resultado.push({
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      lugaresDisponibles,
      disponible: lugaresDisponibles >= totalPersonas,
    });
  }

  res.json({ bloques: resultado, temporada: horario.temporada });
}

async function crearReserva(req, res) {
  const { fecha, horaInicio, personasAdultos, personasNinos, nombre, habitacion } = req.body;

  const adultos = Number(personasAdultos);
  const ninos = Number(personasNinos || 0);

  if (!fecha || !horaInicio || !adultos) {
    return res.status(400).json({ error: "fecha, horaInicio y personasAdultos son obligatorios." });
  }
  if (!nombre || !habitacion) {
    return res.status(400).json({ error: "nombre y habitacion son obligatorios." });
  }

  const horario = await resolverHorarioDelDia(fecha);
  if (!horario) return res.status(409).json({ error: "El spa no abre ese día." });

  const bloques = generarBloques(horario.horaApertura, horario.horaCierre);
  if (!bloques.some((b) => b.horaInicio === horaInicio)) {
    return res.status(400).json({ error: "Ese horario no está disponible ese día." });
  }

  if (ninos > 0) {
    const permitido = await permiteNinosEnBloque(horaInicio);
    if (!permitido) {
      return res.status(409).json({ error: "Ese horario no admite niños. Probá entre 10:00 y 14:00, o desde las 19:00." });
    }
  }

  try {
    const reserva = await prisma.$transaction(async (tx) => {
      const fechaDia = inicioDia(fecha);
      const { capacidadMaxima, ocupadas } = await estadoBloque(tx, fecha, horaInicio);

      if (ocupadas + adultos + ninos > capacidadMaxima) {
        const error = new Error("No hay lugar suficiente en ese horario.");
        error.status = 409;
        throw error;
      }

      const horaFin = bloques.find((b) => b.horaInicio === horaInicio).horaFin;

      const turno = await tx.turnoSpa.upsert({
        where: { fecha_horaInicio: { fecha: fechaDia, horaInicio } },
        update: {},
        create: { fecha: fechaDia, horaInicio, horaFin, capacidadMaxima: 25 },
      });

      return tx.reservaSpa.create({
        data: {
          nombre: nombre.trim(),
          habitacion: habitacion.trim(),
          turnoId: turno.id,
          personasAdultos: adultos,
          personasNinos: ninos,
        },
        include: { turno: true },
      });
    });

    res.status(201).json(reserva);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || "Error al crear la reserva." });
  }
}

// =========================
// ADMIN (ADMIN / ADMIN_SPA)
// =========================

async function panelResumen(req, res) {
  const fechaQuery = req.query.fecha || new Date().toISOString().slice(0, 10);
  const fechaDia = inicioDia(fechaQuery);

  const turnosDelDia = await prisma.turnoSpa.findMany({
    where: { fecha: fechaDia },
    include: { reservas: { where: { estado: "CONFIRMADA" } } },
  });

  const reservas = turnosDelDia.flatMap((t) => t.reservas);
  const personas = reservas.reduce((acc, r) => acc + r.personasAdultos + r.personasNinos, 0);

  res.json({ fecha: fechaQuery, reservasHoy: reservas.length, personas, turnosUsados: turnosDelDia.length });
}

async function listarReservas(req, res) {
  const { fecha, estado } = req.query;
  const where = {};
  if (estado) where.estado = estado;
  if (fecha) where.turno = { fecha: inicioDia(fecha) };

  const reservas = await prisma.reservaSpa.findMany({
    where,
    include: { turno: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(reservas);
}

async function cancelarReserva(req, res) {
  const { id } = req.params;
  try {
    const reserva = await prisma.reservaSpa.update({ where: { id }, data: { estado: "CANCELADA" } });
    res.json(reserva);
  } catch (err) {
    res.status(404).json({ error: "Reserva no encontrada." });
  }
}

async function listarTemporadas(req, res) {
  const temporadas = await prisma.temporadaSpa.findMany({ orderBy: { fechaInicio: "asc" } });
  res.json(temporadas);
}

async function crearTemporada(req, res) {
  const { nombre, fechaInicio, fechaFin, horaApertura, horaCierre } = req.body;
  if (!nombre || !fechaInicio || !fechaFin || !horaApertura || !horaCierre) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  const temporada = await prisma.temporadaSpa.create({
    data: { nombre, fechaInicio: new Date(fechaInicio), fechaFin: new Date(fechaFin), horaApertura, horaCierre },
  });
  res.status(201).json(temporada);
}

async function editarTemporada(req, res) {
  const { id } = req.params;
  const { nombre, fechaInicio, fechaFin, horaApertura, horaCierre, activo } = req.body;
  try {
    const temporada = await prisma.temporadaSpa.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(fechaInicio !== undefined ? { fechaInicio: new Date(fechaInicio) } : {}),
        ...(fechaFin !== undefined ? { fechaFin: new Date(fechaFin) } : {}),
        ...(horaApertura !== undefined ? { horaApertura } : {}),
        ...(horaCierre !== undefined ? { horaCierre } : {}),
        ...(activo !== undefined ? { activo } : {}),
      },
    });
    res.json(temporada);
  } catch (err) {
    res.status(404).json({ error: "Temporada no encontrada." });
  }
}

async function eliminarTemporada(req, res) {
  const { id } = req.params;
  try {
    await prisma.temporadaSpa.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: "Temporada no encontrada." });
  }
}

async function listarHorarioBase(req, res) {
  const horarios = await prisma.horarioBaseSpa.findMany({ orderBy: { diaSemana: "asc" } });
  res.json(horarios);
}

async function guardarHorarioBase(req, res) {
  const { diaSemana, horaApertura, horaCierre } = req.body;
  if (diaSemana === undefined || !horaApertura || !horaCierre) {
    return res.status(400).json({ error: "diaSemana, horaApertura y horaCierre son obligatorios." });
  }
  const horario = await prisma.horarioBaseSpa.upsert({
    where: { diaSemana: Number(diaSemana) },
    update: { horaApertura, horaCierre },
    create: { diaSemana: Number(diaSemana), horaApertura, horaCierre },
  });
  res.json(horario);
}

async function listarRestriccionesNinos(req, res) {
  const restricciones = await prisma.restriccionNinosSpa.findMany({ orderBy: { horaInicio: "asc" } });
  res.json(restricciones);
}

async function crearRestriccionNinos(req, res) {
  const { horaInicio, horaFin } = req.body;
  if (!horaInicio || !horaFin) return res.status(400).json({ error: "horaInicio y horaFin son obligatorios." });
  const restriccion = await prisma.restriccionNinosSpa.create({ data: { horaInicio, horaFin } });
  res.status(201).json(restriccion);
}

async function eliminarRestriccionNinos(req, res) {
  const { id } = req.params;
  try {
    await prisma.restriccionNinosSpa.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: "Restricción no encontrada." });
  }
}

module.exports = {
  listarHorariosDisponibles,
  crearReserva,
  panelResumen,
  listarReservas,
  cancelarReserva,
  listarTemporadas,
  crearTemporada,
  editarTemporada,
  eliminarTemporada,
  listarHorarioBase,
  guardarHorarioBase,
  listarRestriccionesNinos,
  crearRestriccionNinos,
  eliminarRestriccionNinos,
};
