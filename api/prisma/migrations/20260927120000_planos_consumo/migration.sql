-- AlterTable
ALTER TABLE "contas" ALTER COLUMN "plano" SET DEFAULT 'piloto',
ADD COLUMN     "cicloInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pilotoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "limiteGeracoes" INTEGER,
ADD COLUMN     "limitePerfis" INTEGER,
ADD COLUMN     "perfisExtras" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "geracoesExtras" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "geracoesExtrasCiclo" TIMESTAMP(3);

-- Contas já existentes (plano "contratado", sem precificação) viram "sob
-- medida" sem override = sem limite: nada muda pra quem já usa hoje até o
-- superadmin definir o plano de cada uma.
UPDATE "contas" SET "plano" = 'sob_medida' WHERE "plano" = 'contratado';

-- AlterTable
ALTER TABLE "leads_contato" ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'site',
ADD COLUMN     "contaId" TEXT;

-- CreateTable
CREATE TABLE "consumo_geracoes" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "perfilId" TEXT,
    "postId" TEXT,
    "canal" "SaidaCanal",
    "tipo" TEXT NOT NULL,
    "contabilizada" BOOLEAN NOT NULL DEFAULT true,
    "modelo" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "cacheReadTokens" INTEGER,
    "cacheWriteTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumo_geracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consumo_geracoes_contaId_createdAt_idx" ON "consumo_geracoes"("contaId", "createdAt");

-- CreateIndex
CREATE INDEX "consumo_geracoes_postId_idx" ON "consumo_geracoes"("postId");

-- AddForeignKey
ALTER TABLE "consumo_geracoes" ADD CONSTRAINT "consumo_geracoes_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
