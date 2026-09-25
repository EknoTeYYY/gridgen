-- CreateTable
CREATE TABLE "propostas_calendario" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "mesReferencia" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "frequenciaJustificativa" TEXT NOT NULL,
    "totalPautas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aprovadoEm" TIMESTAMP(3),
    CONSTRAINT "propostas_calendario_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "pautas_calendario" (
    "id" TEXT NOT NULL,
    "propostaId" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "abordagem" TEXT NOT NULL,
    "publico" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "motivoEscolha" TEXT NOT NULL,
    "tipo" "PostTipo" NOT NULL,
    "formato" "PostFormato" NOT NULL DEFAULT 'feed',
    "dataHorario" TIMESTAMP(3) NOT NULL,
    "direcaoVisual" TEXT NOT NULL,
    "acaoDesejada" TEXT NOT NULL,
    "origemInformacao" TEXT NOT NULL,
    "dependencias" TEXT,
    "alternativa" TEXT,
    "ocasiao" TEXT,
    "postId" TEXT,
    "motivoUltimaTroca" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pautas_calendario_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "propostas_calendario_perfilId_idx" ON "propostas_calendario"("perfilId");
-- CreateIndex
CREATE UNIQUE INDEX "propostas_calendario_perfilId_mesReferencia_key" ON "propostas_calendario"("perfilId", "mesReferencia");
-- CreateIndex
CREATE INDEX "pautas_calendario_propostaId_idx" ON "pautas_calendario"("propostaId");
-- AddForeignKey
ALTER TABLE "propostas_calendario" ADD CONSTRAINT "propostas_calendario_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "pautas_calendario" ADD CONSTRAINT "pautas_calendario_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "propostas_calendario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
