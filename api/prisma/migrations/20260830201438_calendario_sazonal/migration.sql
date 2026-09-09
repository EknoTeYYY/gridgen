-- CreateEnum
CREATE TYPE "PostOrigem" AS ENUM ('adhoc', 'agenda');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "campanhaData" TIMESTAMP(3),
ADD COLUMN     "campanhaNome" TEXT,
ADD COLUMN     "campanhaSlug" TEXT,
ADD COLUMN     "origem" "PostOrigem" NOT NULL DEFAULT 'adhoc';

-- CreateTable
CREATE TABLE "datas_personalizadas" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "dia" INTEGER NOT NULL,
    "tipoSugerido" "PostTipo" NOT NULL DEFAULT 'oferta',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "datas_personalizadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "datas_personalizadas_perfilId_idx" ON "datas_personalizadas"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_perfilId_campanhaSlug_campanhaData_key" ON "posts"("perfilId", "campanhaSlug", "campanhaData");

-- AddForeignKey
ALTER TABLE "datas_personalizadas" ADD CONSTRAINT "datas_personalizadas_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

