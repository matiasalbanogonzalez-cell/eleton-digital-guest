const prisma = require("../lib/prisma");
const { hashearPassword } = require("../lib/auth");

// Mismo patrón que usa Recreación (ver inscripcionController.js) para
// identificar/crear un huésped a partir de nombre + habitación, sin login.
// Se duplica acá deliberadamente para no tocar el módulo de Recreación.
async function encontrarOCrearHuesped({ nombre, habitacion }) {
    const nombreLimpio = nombre.trim();
    const habitacionLimpia = habitacion.trim();
    const clave = `${nombreLimpio.toLowerCase().replace(/\s+/g, "_")}_${habitacionLimpia.toLowerCase().replace(/\s+/g, "_")}`;
    const email = `guest+${encodeURIComponent(clave)}@guest.eleton.local`;

    let usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
        const passwordHash = await hashearPassword(`guest-${Date.now()}-${Math.random()}`);
        usuario = await prisma.usuario.create({
            data: {
                nombre: nombreLimpio,
                apellido: "",
                email,
                passwordHash,
                habitacion: habitacionLimpia,
                rol: "HUESPED",
            },
        });
    }

    return usuario;
}

// Normaliza "YYYY-MM-DD" a medianoche UTC, para que todas las reservas de un
// mismo día se agrupen bajo la misma fecha sin importar la hora de creación.
function inicioDia(fechaStr) {
    return new Date(`${fechaStr}T00:00:00.000Z`);
}

function fechaISO(date) {
    return date.toISOString().slice(0, 10);
}

// Busca, entre los salones habilitados para ese servicio/fecha(/horario), el
// primero (de menor a mayor capacidad, para no "gastar" el salón más grande
// en un grupo chico) que tenga mesa libre y espacio para la cantidad de personas.
async function encontrarSalonDisponible(tx, { fecha, servicioId, horarioId, personas }) {
    const fechaDia = inicioDia(fecha);

    const habilitados = await tx.disponibilidadSalonResto.findMany({
        where: { servicioId, fecha: fechaDia, habilitado: true },
        include: { salon: true },
    });

    const salonesHabilitados = habilitados
        .map((d) => d.salon)
        .filter((s) => s.activo)
        .sort((a, b) => a.capacidadPersonas - b.capacidadPersonas);

    for (const salon of salonesHabilitados) {
        const reservasActuales = await tx.reservaResto.findMany({
            where: { salonId: salon.id, servicioId, horarioId: horarioId || null, fecha: fechaDia, estado: "CONFIRMADA" },
        });

        const personasReservadas = reservasActuales.reduce((acc, r) => acc + r.personas, 0);
        const mesasUsadas = reservasActuales.length;

        const cabenPersonas = personasReservadas + Number(personas) <= salon.capacidadPersonas;
        const hayMesaLibre = mesasUsadas < salon.mesas;

        if (cabenPersonas && hayMesaLibre) {
            return salon;
        }
    }

    return null;
}

// Suma, entre los salones habilitados para ese servicio/fecha(/horario), los
// lugares que todavía se pueden ocupar (solo cuenta salones con mesa libre;
// un salón sin mesas libres aporta 0 aunque le "sobre" capacidad de personas).
async function calcularLugaresDisponibles(tx, { fecha, servicioId, horarioId }) {
    const fechaDia = inicioDia(fecha);

    const habilitados = await tx.disponibilidadSalonResto.findMany({
        where: { servicioId, fecha: fechaDia, habilitado: true },
        include: { salon: true },
    });

    const salonesHabilitados = habilitados.map((d) => d.salon).filter((s) => s.activo);

    let total = 0;
    for (const salon of salonesHabilitados) {
        const reservasActuales = await tx.reservaResto.findMany({
            where: { salonId: salon.id, servicioId, horarioId: horarioId || null, fecha: fechaDia, estado: "CONFIRMADA" },
        });

        const personasReservadas = reservasActuales.reduce((acc, r) => acc + r.personas, 0);
        const mesasUsadas = reservasActuales.length;

        if (mesasUsadas < salon.mesas) {
            total += Math.max(0, salon.capacidadPersonas - personasReservadas);
        }
    }

    return total;
}

// =========================
// PÚBLICO — flujo del huésped
// =========================

async function listarServicios(req, res) {
    const servicios = await prisma.servicioResto.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
    });
    res.json(servicios);
}

// Horarios puntuales de un servicio (ej: Cena → 21:00 / 22:00). Si el
// servicio no tiene horarios cargados, devuelve un array vacío: el frontend
// interpreta eso como "este servicio se reserva sin elegir hora puntual".
async function listarHorarios(req, res) {
    const { servicioId } = req.query;
    if (!servicioId) return res.status(400).json({ error: "servicioId es obligatorio." });

    const horarios = await prisma.horarioResto.findMany({
        where: { servicioId, activo: true },
        orderBy: { hora: "asc" },
    });
    res.json(horarios);
}

async function consultarDisponibilidad(req, res) {
    const { fecha, servicioId, horarioId, personas } = req.query;

    if (!fecha || !servicioId || !personas) {
        return res.status(400).json({ error: "fecha, servicioId y personas son obligatorios." });
    }

    const personasNumero = Number(personas);
    if (!Number.isFinite(personasNumero) || personasNumero <= 0) {
        return res.status(400).json({ error: "Cantidad de personas inválida." });
    }

    const [salon, lugaresDisponibles] = await Promise.all([
        encontrarSalonDisponible(prisma, { fecha, servicioId, horarioId, personas: personasNumero }),
        calcularLugaresDisponibles(prisma, { fecha, servicioId, horarioId }),
    ]);
    res.json({ disponible: !!salon, lugaresDisponibles });
}

// Caso: reservar mesa. El huésped nunca elige el salón: se asigna automáticamente
// entre los habilitados por el administrador para ese servicio/fecha.
async function crearReserva(req, res) {
    const { servicioId, horarioId, fecha, personas, nombre, habitacion } = req.body;
    const personasNumero = Number(personas);

    if (!servicioId || !fecha || !personas) {
        return res.status(400).json({ error: "servicioId, fecha y personas son obligatorios." });
    }
    if (!Number.isFinite(personasNumero) || personasNumero <= 0) {
        return res.status(400).json({ error: "Cantidad de personas inválida." });
    }

    let usuarioId = null;
    let nombreFinal;
    let habitacionFinal;

    if (req.usuario) {
        const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });
        usuarioId = usuario.id;
        nombreFinal = `${usuario.nombre} ${usuario.apellido || ""}`.trim();
        habitacionFinal = usuario.habitacion || habitacion;
    } else {
        if (!nombre || !habitacion) {
            return res.status(400).json({ error: "nombre y habitacion son obligatorios." });
        }
        if (!/^[A-Za-z0-9- ]+$/.test(habitacion.trim())) {
            return res.status(400).json({ error: "Número de habitación inválido." });
        }
        const usuario = await encontrarOCrearHuesped({ nombre, habitacion });
        usuarioId = usuario.id;
        nombreFinal = nombre.trim();
        habitacionFinal = habitacion.trim();
    }

    try {
        const reserva = await prisma.$transaction(async (tx) => {
            const servicio = await tx.servicioResto.findUnique({ where: { id: servicioId } });
            if (!servicio || !servicio.activo) {
                const error = new Error("El servicio elegido no está disponible.");
                error.status = 404;
                throw error;
            }

            if (horarioId) {
                const horario = await tx.horarioResto.findUnique({ where: { id: horarioId } });
                if (!horario || !horario.activo || horario.servicioId !== servicioId) {
                    const error = new Error("El horario elegido no está disponible.");
                    error.status = 404;
                    throw error;
                }
            }

            const salon = await encontrarSalonDisponible(tx, { fecha, servicioId, horarioId, personas: personasNumero });
            if (!salon) {
                const error = new Error("No hay disponibilidad para esta fecha y horario.");
                error.status = 409;
                throw error;
            }

            return tx.reservaResto.create({
                data: {
                    nombre: nombreFinal,
                    habitacion: habitacionFinal,
                    personas: personasNumero,
                    fecha: inicioDia(fecha),
                    servicioId,
                    horarioId: horarioId || null,
                    salonId: salon.id,
                    usuarioId,
                },
                include: { servicio: true, salon: true, horario: true },
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
// ADMIN — panel de Restó (solo ADMIN)
// =========================

async function panelResumen(req, res) {
    const fechaQuery = req.query.fecha || fechaISO(new Date());
    const fechaDia = inicioDia(fechaQuery);

    const reservas = await prisma.reservaResto.findMany({
        where: { fecha: fechaDia, estado: "CONFIRMADA" },
    });

    const personas = reservas.reduce((acc, r) => acc + r.personas, 0);
    const mesasOcupadas = reservas.length;

    const salonesActivos = await prisma.salonResto.findMany({ where: { activo: true } });
    const mesasTotales = salonesActivos.reduce((acc, s) => acc + s.mesas, 0);

    res.json({
        fecha: fechaQuery,
        reservasHoy: reservas.length,
        personas,
        mesasOcupadas,
        mesasDisponibles: Math.max(mesasTotales - mesasOcupadas, 0),
    });
}

async function listarReservas(req, res) {
    const { fecha, servicioId, salonId, estado } = req.query;

    const where = {};
    if (fecha) where.fecha = inicioDia(fecha);
    if (servicioId) where.servicioId = servicioId;
    if (salonId) where.salonId = salonId;
    if (estado) where.estado = estado;

    const reservas = await prisma.reservaResto.findMany({
        where,
        include: { servicio: true, salon: true, horario: true },
        orderBy: { createdAt: "desc" },
    });

    res.json(reservas);
}

async function cancelarReserva(req, res) {
    const { id } = req.params;
    try {
        const reserva = await prisma.reservaResto.update({
            where: { id },
            data: { estado: "CANCELADA" },
        });
        res.json(reserva);
    } catch (err) {
        res.status(404).json({ error: "Reserva no encontrada." });
    }
}

async function listarSalones(req, res) {
    const salones = await prisma.salonResto.findMany({ orderBy: { nombre: "asc" } });
    res.json(salones);
}

async function crearSalon(req, res) {
    const { nombre, mesas, capacidadPersonas } = req.body;
    if (!nombre || !mesas || !capacidadPersonas) {
        return res.status(400).json({ error: "nombre, mesas y capacidadPersonas son obligatorios." });
    }
    try {
        const salon = await prisma.salonResto.create({
            data: { nombre: nombre.trim(), mesas: Number(mesas), capacidadPersonas: Number(capacidadPersonas) },
        });
        res.status(201).json(salon);
    } catch (err) {
        res.status(409).json({ error: "Ya existe un salón con ese nombre." });
    }
}

async function editarSalon(req, res) {
    const { id } = req.params;
    const { nombre, mesas, capacidadPersonas } = req.body;

    try {
        const salon = await prisma.salonResto.update({
            where: { id },
            data: {
                ...(nombre !== undefined ? { nombre: nombre.trim() } : {}),
                ...(mesas !== undefined ? { mesas: Number(mesas) } : {}),
                ...(capacidadPersonas !== undefined ? { capacidadPersonas: Number(capacidadPersonas) } : {}),
            },
        });
        res.json(salon);
    } catch (err) {
        res.status(404).json({ error: "Salón no encontrado." });
    }
}

async function toggleEstadoSalon(req, res) {
    const { id } = req.params;
    const salon = await prisma.salonResto.findUnique({ where: { id } });
    if (!salon) return res.status(404).json({ error: "Salón no encontrado." });

    const actualizado = await prisma.salonResto.update({
        where: { id },
        data: { activo: !salon.activo },
    });
    res.json(actualizado);
}

// Devuelve la matriz salón x servicio con el estado habilitado/deshabilitado
// para una fecha puntual (si no existe configuración explícita, se asume
// habilitado por defecto para no bloquear salones nuevos sin configurar).
async function obtenerConfigDisponibilidad(req, res) {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "fecha es obligatoria." });
    const fechaDia = inicioDia(fecha);

    const [salones, servicios, existentes] = await Promise.all([
        prisma.salonResto.findMany({ orderBy: { nombre: "asc" } }),
        prisma.servicioResto.findMany({ orderBy: { nombre: "asc" } }),
        prisma.disponibilidadSalonResto.findMany({ where: { fecha: fechaDia } }),
    ]);

    const mapaExistente = new Map(existentes.map((d) => [`${d.salonId}_${d.servicioId}`, d.habilitado]));

    const config = [];
    for (const salon of salones) {
        for (const servicio of servicios) {
            const clave = `${salon.id}_${servicio.id}`;
            config.push({
                salonId: salon.id,
                salonNombre: salon.nombre,
                servicioId: servicio.id,
                servicioNombre: servicio.nombre,
                habilitado: mapaExistente.has(clave) ? mapaExistente.get(clave) : true,
            });
        }
    }

    res.json({ fecha, config });
}

async function actualizarConfigDisponibilidad(req, res) {
    const { salonId, servicioId, fecha, habilitado } = req.body;
    if (!salonId || !servicioId || !fecha || typeof habilitado !== "boolean") {
        return res.status(400).json({ error: "salonId, servicioId, fecha y habilitado son obligatorios." });
    }

    const fechaDia = inicioDia(fecha);

    const actualizado = await prisma.disponibilidadSalonResto.upsert({
        where: { salonId_servicioId_fecha: { salonId, servicioId, fecha: fechaDia } },
        update: { habilitado },
        create: { salonId, servicioId, fecha: fechaDia, habilitado },
    });

    res.json(actualizado);
}

module.exports = {
    listarServicios,
    listarHorarios,
    consultarDisponibilidad,
    crearReserva,
    panelResumen,
    listarReservas,
    cancelarReserva,
    listarSalones,
    crearSalon,
    editarSalon,
    toggleEstadoSalon,
    obtenerConfigDisponibilidad,
    actualizarConfigDisponibilidad,
};