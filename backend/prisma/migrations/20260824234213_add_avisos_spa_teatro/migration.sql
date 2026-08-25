-- CreateEnum
CREATE TYPE "PrioridadAviso" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoReservaSpa" AS ENUM ('CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "EstadoFuncion" AS ENUM ('PROGRAMADA', 'CANCELADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "EstadoReservaTeatro" AS ENUM ('CONFIRMADA', 'CANCELADA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Rol" ADD VALUE 'ADMIN_RESTO';
ALTER TYPE "Rol" ADD VALUE 'ADMIN_SPA';
ALTER TYPE "Rol" ADD VALUE 'ADMIN_TEATRO';

-- CreateTable
CREATE TABLE "zonas_hotel" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "habitaciones" TEXT[],

    CONSTRAINT "zonas_hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "prioridad" "PrioridadAviso" NOT NULL DEFAULT 'MEDIA',
    "seccionAfectada" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporadas_spa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horaApertura" TEXT NOT NULL,
    "horaCierre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "temporadas_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario_base_spa" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaApertura" TEXT NOT NULL,
    "horaCierre" TEXT NOT NULL,

    CONSTRAINT "horario_base_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restriccion_ninos_spa" (
    "id" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "restriccion_ninos_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos_spa" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "capacidadMaxima" INTEGER NOT NULL DEFAULT 25,

    CONSTRAINT "turnos_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_spa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "habitacion" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "personasAdultos" INTEGER NOT NULL DEFAULT 1,
    "personasNinos" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoReservaSpa" NOT NULL DEFAULT 'CONFIRMADA',
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_spa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formatos_sala_teatro" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "aforo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formatos_sala_teatro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funciones_teatro" (
    "id" TEXT NOT NULL,
    "espectaculo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "formatoSalaId" TEXT NOT NULL,
    "estado" "EstadoFuncion" NOT NULL DEFAULT 'PROGRAMADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funciones_teatro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_teatro" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "habitacion" TEXT NOT NULL,
    "funcionId" TEXT NOT NULL,
    "personas" INTEGER NOT NULL,
    "estado" "EstadoReservaTeatro" NOT NULL DEFAULT 'CONFIRMADA',
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_teatro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AvisoToZonaHotel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AvisoToZonaHotel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "zonas_hotel_nombre_key" ON "zonas_hotel"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "horario_base_spa_diaSemana_key" ON "horario_base_spa"("diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_spa_fecha_horaInicio_key" ON "turnos_spa"("fecha", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "formatos_sala_teatro_nombre_key" ON "formatos_sala_teatro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "funciones_teatro_fecha_hora_key" ON "funciones_teatro"("fecha", "hora");

-- CreateIndex
CREATE INDEX "_AvisoToZonaHotel_B_index" ON "_AvisoToZonaHotel"("B");

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_spa" ADD CONSTRAINT "reservas_spa_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos_spa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_spa" ADD CONSTRAINT "reservas_spa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funciones_teatro" ADD CONSTRAINT "funciones_teatro_formatoSalaId_fkey" FOREIGN KEY ("formatoSalaId") REFERENCES "formatos_sala_teatro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_teatro" ADD CONSTRAINT "reservas_teatro_funcionId_fkey" FOREIGN KEY ("funcionId") REFERENCES "funciones_teatro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_teatro" ADD CONSTRAINT "reservas_teatro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvisoToZonaHotel" ADD CONSTRAINT "_AvisoToZonaHotel_A_fkey" FOREIGN KEY ("A") REFERENCES "avisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvisoToZonaHotel" ADD CONSTRAINT "_AvisoToZonaHotel_B_fkey" FOREIGN KEY ("B") REFERENCES "zonas_hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
