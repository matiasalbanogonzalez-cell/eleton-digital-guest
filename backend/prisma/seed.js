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

  console.log("Seed completado. Usuarios de prueba (password: password123):");
  console.log("  admin@eleton.com (ADMIN)");
  console.log("  juan.perez@eleton.com (RECREADOR)");
  console.log("  huesped@demo.com (HUESPED)");
  console.log(`  ${agenda.length} actividades de la agenda de viernes a domingo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
