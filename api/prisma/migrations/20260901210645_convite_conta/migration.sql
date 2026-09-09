-- AlterTable
ALTER TABLE "contas" ALTER COLUMN "plano" SET DEFAULT 'contratado';

-- CreateTable
CREATE TABLE "convites_conta" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "criadoPorUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "aceitoEm" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_conta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convites_conta_tokenHash_key" ON "convites_conta"("tokenHash");

-- CreateIndex
CREATE INDEX "convites_conta_contaId_idx" ON "convites_conta"("contaId");

-- AddForeignKey
ALTER TABLE "convites_conta" ADD CONSTRAINT "convites_conta_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites_conta" ADD CONSTRAINT "convites_conta_criadoPorUserId_fkey" FOREIGN KEY ("criadoPorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
