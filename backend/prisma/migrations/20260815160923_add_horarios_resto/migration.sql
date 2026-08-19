-- AlterTable
ALTER TABLE "reservas_resto" ADD COLUMN     "horarioId" TEXT;

-- CreateTable
CREATE TABLE "horarios_resto" (
    "id" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "horarios_resto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "horarios_resto_servicioId_hora_key" ON "horarios_resto"("servicioId", "hora");

-- AddForeignKey
ALTER TABLE "horarios_resto" ADD CONSTRAINT "horarios_resto_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_resto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_resto" ADD CONSTRAINT "reservas_resto_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horarios_resto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
