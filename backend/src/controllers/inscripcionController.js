const prisma = require("../lib/prisma");
const { hashearPassword } = require("../lib/auth");

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

// Caso 4: inscribirse a una actividad
// Reglas de negocio aplicadas:
//  - Un huésped no puede inscribirse dos veces a la misma actividad.
//  - No puede anotarse si no hay cupos disponibles (pasa a lista de espera).
//  - Las actividades finalizadas o canceladas no aceptan nuevas inscripciones.
async function inscribirse(req, res) {
  const { actividadId, nombre, habitacion, edad } = req.body;
  const edadNumero = Number(edad);

  if (!actividadId) {
    return res.status(400).json({ error: "actividadId es obligatorio." });
  }

  let usuarioId;
  if (req.usuario) {
    usuarioId = req.usuario.id;
  } else {
    if (!nombre || !habitacion || !edad) {
      return res.status(400).json({ error: "nombre, habitacion y edad son obligatorios." });
    }

    if (!/^[A-Za-z0-9- ]+$/.test(habitacion.trim())) {
      return res.status(400).json({ error: "Número de habitación inválido." });
    }

    if (!Number.isFinite(edadNumero) || edadNumero <= 0) {
      return res.status(400).json({ error: "Edad inválida." });
    }

    const usuario = await encontrarOCrearHuesped({ nombre, habitacion });
    usuarioId = usuario.id;
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const actividad = await tx.actividad.findUnique({
        where: { id: actividadId },
        include: { inscripciones: { where: { estado: "CONFIRMADA" } } },
      });

      if (!actividad) {
        const error = new Error("Actividad no encontrada.");
        error.status = 404;
        throw error;
      }

      if (actividad.estado === "FINALIZADA" || actividad.estado === "CANCELADA") {
        const error = new Error("Esta actividad ya no acepta inscripciones.");
        error.status = 409;
        throw error;
      }

      if (!req.usuario) {
        if (edadNumero < actividad.edadMinima || edadNumero > actividad.edadMaxima) {
          const error = new Error(`La edad debe estar entre ${actividad.edadMinima} y ${actividad.edadMaxima} años.`);
          error.status = 400;
          throw error;
        }
      }

      const yaInscripto = await tx.inscripcion.findUnique({
        where: { usuarioId_actividadId: { usuarioId, actividadId } },
      });

      if (yaInscripto && yaInscripto.estado !== "CANCELADA") {
        const error = new Error("Ya estás inscripto en esta actividad.");
        error.status = 409;
        throw error;
      }

      const cuposDisponibles = actividad.cupoMaximo - actividad.inscripciones.length;
      const estadoInscripcion = cuposDisponibles > 0 ? "CONFIRMADA" : "LISTA_ESPERA";

      const inscripcion = yaInscripto
        ? await tx.inscripcion.update({
            where: { id: yaInscripto.id },
            data: { estado: estadoInscripcion, fechaInscripcion: new Date() },
          })
        : await tx.inscripcion.create({
            data: { usuarioId, actividadId, estado: estadoInscripcion },
          });

      if (estadoInscripcion === "CONFIRMADA" && cuposDisponibles - 1 <= 0) {
        await tx.actividad.update({ where: { id: actividadId }, data: { estado: "CUPO_LLENO" } });
      }

      return inscripcion;
    });

    res.status(201).json(resultado);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || "Error al inscribirse." });
  }
}

// Caso 5: cancelar inscripción
// Regla de negocio: si cancela, el cupo vuelve a incrementarse (y se promueve
// automáticamente al primero de la lista de espera, si existe).
async function cancelarInscripcion(req, res) {
  const usuarioId = req.usuario.id;
  const { actividadId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const inscripcion = await tx.inscripcion.findUnique({
        where: { usuarioId_actividadId: { usuarioId, actividadId } },
      });

      if (!inscripcion || inscripcion.estado === "CANCELADA") {
        const error = new Error("No estás inscripto en esta actividad.");
        error.status = 404;
        throw error;
      }

      const eraConfirmada = inscripcion.estado === "CONFIRMADA";

      await tx.inscripcion.update({
        where: { id: inscripcion.id },
        data: { estado: "CANCELADA" },
      });

      if (eraConfirmada) {
        // Reabrir la actividad si estaba en CUPO_LLENO
        await tx.actividad.updateMany({
          where: { id: actividadId, estado: "CUPO_LLENO" },
          data: { estado: "ABIERTA" },
        });

        // Promover al primero en lista de espera, si existe
        const siguienteEnEspera = await tx.inscripcion.findFirst({
          where: { actividadId, estado: "LISTA_ESPERA" },
          orderBy: { fechaInscripcion: "asc" },
        });

        if (siguienteEnEspera) {
          await tx.inscripcion.update({
            where: { id: siguienteEnEspera.id },
            data: { estado: "CONFIRMADA" },
          });
        }
      }
    });

    res.status(204).send();
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: err.message || "Error al cancelar la inscripción." });
  }
}

// Caso 6: ver mis actividades
async function misActividades(req, res) {
  const usuarioId = req.usuario.id;

  const inscripciones = await prisma.inscripcion.findMany({
    where: { usuarioId, estado: { in: ["CONFIRMADA", "LISTA_ESPERA"] } },
    include: { actividad: { include: { instructor: true } } },
    orderBy: { fechaInscripcion: "desc" },
  });

  res.json(inscripciones);
}

module.exports = { inscribirse, cancelarInscripcion, misActividades };
