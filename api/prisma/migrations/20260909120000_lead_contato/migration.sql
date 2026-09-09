-- CreateTable
CREATE TABLE "leads_contato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "empresa" TEXT,
    "telefone" TEXT,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_contato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_contato_createdAt_idx" ON "leads_contato"("createdAt");
