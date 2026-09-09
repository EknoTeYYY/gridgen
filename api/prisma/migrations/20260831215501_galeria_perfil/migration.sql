-- CreateTable
CREATE TABLE "galeria_itens" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "pasta" TEXT NOT NULL,
    "nome" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galeria_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "galeria_itens_perfilId_idx" ON "galeria_itens"("perfilId");

-- CreateIndex
CREATE INDEX "galeria_itens_perfilId_pasta_idx" ON "galeria_itens"("perfilId", "pasta");

-- AddForeignKey
ALTER TABLE "galeria_itens" ADD CONSTRAINT "galeria_itens_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
