-- CreateTable
CREATE TABLE "tokens_revocados" (
    "jti" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_revocados_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "tokens_revocados_expiraEn_idx" ON "tokens_revocados"("expiraEn");

-- AddForeignKey
ALTER TABLE "tokens_revocados" ADD CONSTRAINT "tokens_revocados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
