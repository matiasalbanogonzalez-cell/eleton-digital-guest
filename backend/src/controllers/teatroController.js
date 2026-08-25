const prisma = require("../lib/prisma");

function inicioDia(fechaStr) {
  return new Date(`${fechaStr}T00:00:00.000Z`);
}

// =========================
// PÚBLICO
// =========================

async function listarFunciones(req, res) {
  const { desde } = req.query;
  const fechaDesde = desde ? inicioDia(desde) : inicioDia(new Date().toISOString().slice(0, 10));

  const funciones = await prisma.funcionTeatro.findMany({
    where: { estado: "PROGRAMADA", fecha: { gte: fechaDesde } },
    include: { formatoSala: true, reservas: { where: { estado: "CONFIRMADA" } } },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });

  res.json(
    funciones.map((f) => {
      const ocupados = f.reservas.reduce((acc, r) => acc + r.personas, 0);
      return {
        id: f.id,
        espectaculo: f.espectaculo,
        fecha: f.fecha,
        hora: f.hora,
        formatoSala: f.formatoSala.nombre,
        aforo: f.formatoSala.aforo,
        lugaresDisponibles: Math.max(0, f.formatoSala.aforo - ocupados),
      };
    })
  );
}

async function crearReserva(req, res) {
  const { funcionId, personas, nombre, habitacion } = req.body;
  const personasNumero = Number(personas);

  if (!funcionId || !personas) return res.status(400).json({ error: "funcionId y personas son obligatorios." });
  if (!Number.isFinite(personasNumero) || personasNumero <= 0) {
    return res.status(400).json({ error: "Cantidad de personas inválida." });
  }
  if (!nombre || !habitacion) return res.status(400).json({ error: "nombre y habitacion son obligatorios." });

  try {
    const reserva = await prisma.$transaction(async (tx) => {
      const funcion = await tx.funcionTeatro.findUnique({
        where: { id: funcionId },
        include: { formatoSala: true },
      });
      if (!funcion || funcion.estado !== "PROGRAMADA") {
        const error = new Error("Esa función no está disponible.");
        error.status = 404;
        throw error;
      }

      const reservasActuales = await tx.reservaTeatro.findMany({
        where: { funcionId, estado: "CONFIRMADA" },
      });
      const ocupados = reservasActuales.reduce((acc, r) => acc + r.personas, 0);

      // El aforo se lee en vivo desde el formato de sala: si el admin lo bajó
      // después de crear la función, ya impacta acá sin necesidad de migrar nada.
      if (ocupados + personasNumero > funcion.formatoSala.aforo) {
        const error = new Error("No hay lugares suficientes para esa función.");
        error.status = 409;
        throw error;
      }

      return tx.reservaTeatro.create({
        data: { nombre: nombre.trim(), habitacion: habitacion.trim(), funcionId, personas: personasNumero },
        include: { funcion: { include: { formatoSala: true } } },
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
// ADMIN (ADMIN / ADMIN_TEATRO)
// =========================

async function panelResumen(req, res) {
  const fechaQuery = req.query.fecha || new Date().toISOString().slice(0, 10);
  const fechaDia = inicioDia(fechaQuery);

  const funciones = await prisma.funcionTeatro.findMany({
    where: { fecha: fechaDia },
    include: { formatoSala: true, reservas: { where: { estado: "CONFIRMADA" } } },
  });

  const reservas = funciones.flatMap((f) => f.reservas);
  const personas = reservas.reduce((acc, r) => acc + r.personas, 0);

  res.json({ fecha: fechaQuery, funcionesHoy: funciones.length, reservasHoy: reservas.length, personas });
}

async function listarReservas(req, res) {
  const { fecha, funcionId, estado } = req.query;
  const where = {};
  if (funcionId) where.funcionId = funcionId;
  if (estado) where.estado = estado;
  if (fecha) where.funcion = { fecha: inicioDia(fecha) };

  const reservas = await prisma.reservaTeatro.findMany({
    where,
    include: { funcion: { include: { formatoSala: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(reservas);
}

async function cancelarReserva(req, res) {
  const { id } = req.params;
  try {
    const reserva = await prisma.reservaTeatro.update({ where: { id }, data: { estado: "CANCELADA" } });
    res.json(reserva);
  } catch (err) {
    res.status(404).json({ error: "Reserva no encontrada." });
  }
}

async function listarFormatosAdmin(req, res) {
  const formatos = await prisma.formatoSalaTeatro.findMany({ orderBy: { nombre: "asc" } });
  res.json(formatos);
}

async function crearFormato(req, res) {
  const { nombre, aforo } = req.body;
  if (!nombre || !aforo) return res.status(400).json({ error: "nombre y aforo son obligatorios." });
  try {
    const formato = await prisma.formatoSalaTeatro.create({ data: { nombre, aforo: Number(aforo) } });
    res.status(201).json(formato);
  } catch (err) {
    res.status(409).json({ error: "Ya existe un formato con ese nombre." });
  }
}

// El aforo se puede cambiar en cualquier momento: impacta en vivo sobre todas
// las funciones futuras con este formato (no se "congela" al crear la función).
async function editarFormato(req, res) {
  const { id } = req.params;
  const { nombre, aforo, activo } = req.body;
  try {
    const formato = await prisma.formatoSalaTeatro.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(aforo !== undefined ? { aforo: Number(aforo) } : {}),
        ...(activo !== undefined ? { activo } : {}),
      },
    });
    res.json(formato);
  } catch (err) {
    res.status(404).json({ error: "Formato no encontrado." });
  }
}

async function listarFuncionesAdmin(req, res) {
  const { fecha } = req.query;
  const where = fecha ? { fecha: inicioDia(fecha) } : {};
  const funciones = await prisma.funcionTeatro.findMany({
    where,
    include: { formatoSala: true, reservas: { where: { estado: "CONFIRMADA" } } },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });
  res.json(funciones);
}

async function crearFuncion(req, res) {
  const { espectaculo, fecha, hora, formatoSalaId } = req.body;
  if (!espectaculo || !fecha || !hora || !formatoSalaId) {
    return res.status(400).json({ error: "espectaculo, fecha, hora y formatoSalaId son obligatorios." });
  }
  try {
    const funcion = await prisma.funcionTeatro.create({
      data: { espectaculo, fecha: inicioDia(fecha), hora, formatoSalaId },
      include: { formatoSala: true },
    });
    res.status(201).json(funcion);
  } catch (err) {
    res.status(409).json({ error: "Ya existe una función a esa fecha y hora." });
  }
}

async function editarFuncion(req, res) {
  const { id } = req.params;
  const { espectaculo, fecha, hora, formatoSalaId, estado } = req.body;
  try {
    const funcion = await prisma.funcionTeatro.update({
      where: { id },
      data: {
        ...(espectaculo !== undefined ? { espectaculo } : {}),
        ...(fecha !== undefined ? { fecha: inicioDia(fecha) } : {}),
        ...(hora !== undefined ? { hora } : {}),
        ...(formatoSalaId !== undefined ? { formatoSalaId } : {}),
        ...(estado !== undefined ? { estado } : {}),
      },
      include: { formatoSala: true },
    });
    res.json(funcion);
  } catch (err) {
    res.status(404).json({ error: "Función no encontrada." });
  }
}

module.exports = {
  listarFunciones,
  crearReserva,
  panelResumen,
  listarReservas,
  cancelarReserva,
  listarFormatosAdmin,
  crearFormato,
  editarFormato,
  listarFuncionesAdmin,
  crearFuncion,
  editarFuncion,
};
