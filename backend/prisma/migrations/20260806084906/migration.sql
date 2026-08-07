-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('HUESPED', 'RECREADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('KIDS', 'ADOLESCENTES', 'ADULTOS');

-- CreateEnum
CREATE TYPE "EstadoActividad" AS ENUM ('ABIERTA', 'CUPO_LLENO', 'CANCELADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('CONFIRMADA', 'LISTA_ESPERA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "habitacion" TEXT,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'HUESPED',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "instructores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "imagenUrl" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "edadMinima" INTEGER NOT NULL,
    "edadMaxima" INTEGER NOT NULL,
    "cupoMaximo" INTEGER NOT NULL,
    "estado" "EstadoActividad" NOT NULL DEFAULT 'ABIERTA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "instructorId" TEXT,
    "creadaPorId" TEXT,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'CONFIRMADA',
    "asistio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "actividades_fecha_horaInicio_categoria_nombre_key" ON "actividades"("fecha", "horaInicio", "categoria", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_usuarioId_actividadId_key" ON "inscripciones"("usuarioId", "actividadId");

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
