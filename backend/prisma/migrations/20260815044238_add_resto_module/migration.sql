-- CreateEnum
CREATE TYPE "ServicioRestoNombre" AS ENUM ('DESAYUNO', 'ALMUERZO', 'MERIENDA', 'CENA');

-- CreateEnum
CREATE TYPE "EstadoReservaResto" AS ENUM ('CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateTable
CREATE TABLE "salones_resto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "mesas" INTEGER NOT NULL,
    "capacidadPersonas" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salones_resto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios_resto" (
    "id" TEXT NOT NULL,
    "nombre" "ServicioRestoNombre" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicios_resto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad_salon_resto" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilidad_salon_resto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas_resto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "habitacion" TEXT NOT NULL,
    "personas" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "servicioId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "estado" "EstadoReservaResto" NOT NULL DEFAULT 'CONFIRMADA',
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_resto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salones_resto_nombre_key" ON "salones_resto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_resto_nombre_key" ON "servicios_resto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidad_salon_resto_salonId_servicioId_fecha_key" ON "disponibilidad_salon_resto"("salonId", "servicioId", "fecha");

-- AddForeignKey
ALTER TABLE "disponibilidad_salon_resto" ADD CONSTRAINT "disponibilidad_salon_resto_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salones_resto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_salon_resto" ADD CONSTRAINT "disponibilidad_salon_resto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_resto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_resto" ADD CONSTRAINT "reservas_resto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_resto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_resto" ADD CONSTRAINT "reservas_resto_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salones_resto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_resto" ADD CONSTRAINT "reservas_resto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
