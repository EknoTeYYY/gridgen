-- CreateTable
CREATE TABLE "galeria_pastas" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galeria_pastas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "galeria_pastas_perfilId_nome_key" ON "galeria_pastas"("perfilId", "nome");

-- AddForeignKey
ALTER TABLE "galeria_pastas" ADD CONSTRAINT "galeria_pastas_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
