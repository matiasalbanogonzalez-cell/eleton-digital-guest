const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

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

  const instructor = await prisma.instructor.create({
    data: { nombre: "Juan", apellido: "Pérez", email: "juan.perez@eleton.com" },
  });

  await prisma.actividad.create({
    data: {
      nombre: "Búsqueda del Tesoro",
      descripcion: "Una divertida búsqueda con pistas por todo el hotel.",
      categoria: "KIDS",
      fecha: new Date(),
      horaInicio: "15:00",
      horaFin: "16:00",
      lugar: "Parque Principal",
      edadMinima: 5,
      edadMaxima: 10,
      cupoMaximo: 25,
      instructorId: instructor.id,
      creadaPorId: recreador.id,
    },
  });

  await prisma.actividad.create({
    data: {
      nombre: "Yoga al Amanecer",
      descripcion: "Sesión suave de yoga y respiración con vista al mar.",
      categoria: "ADULTOS",
      fecha: new Date(),
      horaInicio: "07:00",
      horaFin: "08:00",
      lugar: "Terraza del Spa",
      edadMinima: 18,
      edadMaxima: 99,
      cupoMaximo: 20,
      creadaPorId: recreador.id,
    },
  });

  console.log("Seed completado. Usuarios de prueba (password: password123):");
  console.log("  admin@eleton.com (ADMIN)");
  console.log("  juan.perez@eleton.com (RECREADOR)");
  console.log("  huesped@demo.com (HUESPED)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
