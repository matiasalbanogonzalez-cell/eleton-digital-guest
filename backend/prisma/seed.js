const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@eleton.com" },
    update: {},
    create: {
      nombre: "Admin", apellido: "Eleton", email: "admin@eleton.com",
      passwordHash, rol: "ADMIN",
    },
  });

  const recreador = await prisma.usuario.upsert({
    where: { email: "juan.perez@eleton.com" },
    update: {},
    create: {
      nombre: "Juan", apellido: "Pérez", email: "juan.perez@eleton.com",
      passwordHash, rol: "RECREADOR",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "huesped@demo.com" },
    update: {},
    create: {
      nombre: "María", apellido: "Gómez", email: "huesped@demo.com",
      passwordHash, rol: "HUESPED", habitacion: "204",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "resto@eleton.com" },
    update: {},
    create: {
      nombre: "Lucía", apellido: "Fernández", email: "resto@eleton.com",
      passwordHash, rol: "ADMIN_RESTO",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "spa@eleton.com" },
    update: {},
    create: {
      nombre: "Carla", apellido: "Ibáñez", email: "spa@eleton.com",
      passwordHash, rol: "ADMIN_SPA",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "teatro@eleton.com" },
    update: {},
    create: {
      nombre: "Diego", apellido: "Ramos", email: "teatro@eleton.com",
      passwordHash, rol: "ADMIN_TEATRO",
    },
  });

  let instructor = await prisma.instructor.findFirst({
    where: { email: "juan.perez@eleton.com" },
  });
  if (!instructor) {
    instructor = await prisma.instructor.create({
      data: { nombre: "Juan", apellido: "Pérez", email: "juan.perez@eleton.com" },
    });
  }

  // Agenda de recreación compartida por Eleton. La clave única del modelo
  // evita duplicados si se ejecuta el seed más de una vez.
  const agenda = [
    // Viernes 7/8
    ["2026-08-07", "10:30", "Taller de Pintura", "ADULTOS"], ["2026-08-07", "10:30", "Taller de Pintura", "ADOLESCENTES"], ["2026-08-07", "10:30", "Tucán de Eko", "KIDS"],
    ["2026-08-07", "12:00", "Taller de Velas de Soja", "ADULTOS"], ["2026-08-07", "12:00", "Taller de Velas de Soja", "ADOLESCENTES"], ["2026-08-07", "12:00", "Grandes Artistas", "KIDS"],
    ["2026-08-07", "15:00", "Tarde de Timbas", "ADULTOS"], ["2026-08-07", "15:00", "Tarde de Timbas", "ADOLESCENTES"], ["2026-08-07", "15:00", "Manos a la Masa", "KIDS"],
    ["2026-08-07", "16:00", "Tarde de Timbas", "ADULTOS"], ["2026-08-07", "16:00", "Tarde de Timbas", "ADOLESCENTES"], ["2026-08-07", "16:00", "Decoración de Tutores", "KIDS"],
    ["2026-08-07", "17:00", "Cine Familiar", "ADULTOS"], ["2026-08-07", "17:00", "Cine Familiar", "ADOLESCENTES"], ["2026-08-07", "17:00", "Cine Familiar", "KIDS"],
    // Sábado 8/8
    ["2026-08-08", "10:30", "Taller de Porcelana Fría", "ADULTOS"], ["2026-08-08", "10:30", "Taller de Porcelana Fría", "ADOLESCENTES"], ["2026-08-08", "10:30", "Manos a la Masa", "KIDS"],
    ["2026-08-08", "12:00", "Taller de Paint and Wine", "ADULTOS"], ["2026-08-08", "12:00", "Torneo de Corn Hole y Yenga", "ADOLESCENTES"], ["2026-08-08", "12:00", "Torneo de Corn Hole y Yenga", "KIDS"],
    ["2026-08-08", "15:00", "Torneo de Arquería", "ADULTOS"], ["2026-08-08", "15:00", "Torneo de Arquería", "ADOLESCENTES"], ["2026-08-08", "15:00", "Pulseras Macramé", "KIDS"],
    ["2026-08-08", "16:00", "Glitter Bar", "ADULTOS"], ["2026-08-08", "16:00", "Glitter Bar", "ADOLESCENTES"], ["2026-08-08", "16:00", "Glitter Bar", "KIDS"],
    ["2026-08-08", "17:00", "Bingo", "ADULTOS"], ["2026-08-08", "17:00", "Bingo", "ADOLESCENTES"], ["2026-08-08", "17:00", "Bingo", "KIDS"],
    // Domingo 9/8
    ["2026-08-09", "10:30", "Caminata al Lago", "ADULTOS"], ["2026-08-09", "10:30", "Caminata al Lago", "ADOLESCENTES"], ["2026-08-09", "10:30", "Cuadro 3D: Mariposa / Loro Arcoíris", "KIDS"],
    ["2026-08-09", "12:00", "Máster Chef", "ADOLESCENTES"], ["2026-08-09", "12:00", "Máster Chef", "KIDS"],
    ["2026-08-09", "15:00", "Taller de Jabones Artesanales", "ADULTOS"], ["2026-08-09", "15:00", "Taller de Jabones Artesanales", "ADOLESCENTES"], ["2026-08-09", "15:00", "Jugamos al Aire Libre", "KIDS"],
    ["2026-08-09", "16:00", "Torneo de Arquería", "ADULTOS"], ["2026-08-09", "16:00", "Torneo de Arquería", "ADOLESCENTES"], ["2026-08-09", "16:00", "Cuadro Sensorial", "KIDS"],
    ["2026-08-09", "17:00", "Clase de Ritmos", "ADULTOS"], ["2026-08-09", "17:00", "Clase de Ritmos", "ADOLESCENTES"], ["2026-08-09", "17:00", "Manos a la Masa", "KIDS"],
  ];
  const finPorHora = { "10:30": "12:00", "12:00": "15:00", "15:00": "16:00", "16:00": "17:00", "17:00": "18:00" };
  const edades = { KIDS: [4, 12], ADOLESCENTES: [13, 17], ADULTOS: [18, 99] };

  await prisma.actividad.createMany({
    data: agenda.map(([fecha, horaInicio, nombre, categoria]) => ({
      nombre, descripcion: `${nombre}, actividad de recreación para ${categoria.toLowerCase()}.`, categoria,
      fecha: new Date(`${fecha}T12:00:00.000Z`), horaInicio, horaFin: finPorHora[horaInicio],
      lugar: "Espacio de Recreación", edadMinima: edades[categoria][0], edadMaxima: edades[categoria][1],
      cupoMaximo: 25, instructorId: instructor.id, creadaPorId: recreador.id,
    })),
    skipDuplicates: true,
  });

  // --- Restó: salones, servicios y disponibilidad de ejemplo ---
  const salonesResto = [
    { nombre: "Restó", mesas: 30, capacidadPersonas: 105 },
    { nombre: "Salón Mahatma", mesas: 100, capacidadPersonas: 300 },
    { nombre: "Sala Francisco", mesas: 20, capacidadPersonas: 60 },
  ];

  const salonesCreados = [];
  for (const s of salonesResto) {
    const salon = await prisma.salonResto.upsert({
      where: { nombre: s.nombre },
      update: {},
      create: s,
    });
    salonesCreados.push(salon);
  }

  const serviciosResto = ["DESAYUNO", "ALMUERZO", "MERIENDA", "CENA"];
  const serviciosCreados = [];
  for (const nombre of serviciosResto) {
    const servicio = await prisma.servicioResto.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    serviciosCreados.push(servicio);
  }

  // Horarios puntuales: por ahora solo la Cena tiene dos turnos fijos.
  const cena = serviciosCreados.find((s) => s.nombre === "CENA");
  const horariosCenaCreados = [];
  for (const hora of ["21:00", "22:00"]) {
    const horario = await prisma.horarioResto.upsert({
      where: { servicioId_hora: { servicioId: cena.id, hora } },
      update: {},
      create: { servicioId: cena.id, hora },
    });
    horariosCenaCreados.push(horario);
  }

  // Disponibilidad de ejemplo: los tres salones habilitados para todos los
  // servicios durante los próximos 14 días, para poder probar el flujo de
  // reserva del huésped sin tener que configurar nada a mano primero.
  const hoy = new Date();
  const disponibilidadData = [];
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy);
    fecha.setUTCDate(hoy.getUTCDate() + i);
    fecha.setUTCHours(0, 0, 0, 0);

    for (const salon of salonesCreados) {
      for (const servicio of serviciosCreados) {
        disponibilidadData.push({ salonId: salon.id, servicioId: servicio.id, fecha, habilitado: true });
      }
    }
  }

  await prisma.disponibilidadSalonResto.createMany({
    data: disponibilidadData,
    skipDuplicates: true,
  });

  console.log("Seed completado. Usuarios de prueba (password: password123):");
  console.log("  admin@eleton.com (ADMIN)");
  console.log("  juan.perez@eleton.com (RECREADOR)");
  console.log("  huesped@demo.com (HUESPED)");
  console.log("  resto@eleton.com (ADMIN_RESTO)");
  console.log("  spa@eleton.com (ADMIN_SPA)");
  console.log("  teatro@eleton.com (ADMIN_TEATRO)");
  console.log(`  ${agenda.length} actividades de la agenda de viernes a domingo`);
  console.log(`  ${salonesCreados.length} salones de Restó, ${serviciosCreados.length} servicios (con ${horariosCenaCreados.length} horarios de Cena) y disponibilidad para los próximos 14 días`);

  // --- Zonas del hotel (para filtrar avisos por ubicación) ---
  const zonasData = [
    { nombre: "Subsuelo", habitaciones: [...Array.from({ length: 16 }, (_, i) => String(i + 1)), "SB", "SA"] },
    { nombre: "Planta Baja", habitaciones: Array.from({ length: 41 - 17 + 1 }, (_, i) => String(i + 17)) },
    { nombre: "Primer Piso", habitaciones: Array.from({ length: 179 - 142 + 1 }, (_, i) => String(i + 142)) },
    { nombre: "Segundo Piso", habitaciones: Array.from({ length: 227 - 201 + 1 }, (_, i) => String(i + 201)) },
  ];
  const zonasCreadas = [];
  for (const z of zonasData) {
    const zona = await prisma.zonaHotel.upsert({ where: { nombre: z.nombre }, update: {}, create: z });
    zonasCreadas.push(zona);
  }

  // Aviso de ejemplo, visible para todos (sin zonas asignadas)
  await prisma.aviso.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      titulo: "Bienvenidos a Eleton",
      mensaje: "Disfrutá tu estadía. Cualquier consulta, comunicate con Guest Service al interno 2243.",
      fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
      fechaFin: new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()),
      prioridad: "BAJA",
      creadoPorId: admin.id,
    },
  });

  console.log(`  ${zonasCreadas.length} zonas del hotel y 1 aviso de ejemplo`);

  // --- Spa: horario base, restricciones para niños ---
  const horarioBaseData = [
    { diaSemana: 0, horaApertura: "09:00", horaCierre: "21:00" }, // domingo
    { diaSemana: 1, horaApertura: "09:00", horaCierre: "20:00" }, // lunes
    { diaSemana: 2, horaApertura: "09:00", horaCierre: "20:00" }, // martes
    { diaSemana: 3, horaApertura: "09:00", horaCierre: "20:00" }, // miércoles
    { diaSemana: 4, horaApertura: "09:00", horaCierre: "20:00" }, // jueves
    { diaSemana: 5, horaApertura: "09:00", horaCierre: "21:00" }, // viernes
    { diaSemana: 6, horaApertura: "09:00", horaCierre: "21:00" }, // sábado
  ];
  for (const h of horarioBaseData) {
    await prisma.horarioBaseSpa.upsert({ where: { diaSemana: h.diaSemana }, update: {}, create: h });
  }

  const restriccionesNinosData = [
    { horaInicio: "10:00", horaFin: "14:00" },
    { horaInicio: "19:00", horaFin: "23:00" },
  ];
  for (const r of restriccionesNinosData) {
    const existe = await prisma.restriccionNinosSpa.findFirst({ where: { horaInicio: r.horaInicio, horaFin: r.horaFin } });
    if (!existe) await prisma.restriccionNinosSpa.create({ data: r });
  }

  // Temporada de ejemplo (verano), para que se pueda ver el mecanismo funcionando
  const temporadaVerano = await prisma.temporadaSpa.findFirst({ where: { nombre: "Verano (ejemplo)" } });
  if (!temporadaVerano) {
    await prisma.temporadaSpa.create({
      data: {
        nombre: "Verano (ejemplo)",
        fechaInicio: new Date(`${hoy.getFullYear()}-12-01T00:00:00.000Z`),
        fechaFin: new Date(`${hoy.getFullYear() + 1}-03-31T00:00:00.000Z`),
        horaApertura: "09:00",
        horaCierre: "21:00",
      },
    });
  }

  console.log("  Horario base del Spa (7 días), 2 restricciones para niños, 1 temporada de ejemplo");

  // --- Teatro: formatos de sala y una función de ejemplo ---
  const formatosData = [
    { nombre: "Auditorio", aforo: 120 },
    { nombre: "Teatro Bar", aforo: 60 },
    { nombre: "Teatro Concert", aforo: 80 },
  ];
  const formatosCreados = [];
  for (const f of formatosData) {
    const formato = await prisma.formatoSalaTeatro.upsert({ where: { nombre: f.nombre }, update: {}, create: f });
    formatosCreados.push(formato);
  }

  const funcionEjemploFecha = new Date(hoy);
  funcionEjemploFecha.setUTCDate(hoy.getUTCDate() + 3);
  funcionEjemploFecha.setUTCHours(0, 0, 0, 0);

  await prisma.funcionTeatro.upsert({
    where: { fecha_hora: { fecha: funcionEjemploFecha, hora: "21:30" } },
    update: {},
    create: {
      espectaculo: "Noche de Humor",
      fecha: funcionEjemploFecha,
      hora: "21:30",
      formatoSalaId: formatosCreados[0].id,
    },
  });

  console.log(`  ${formatosCreados.length} formatos de sala de Teatro y 1 función de ejemplo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });