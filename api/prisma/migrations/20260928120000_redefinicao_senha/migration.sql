-- CreateTable
CREATE TABLE "redefinicoes_senha" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redefinicoes_senha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redefinicoes_senha_tokenHash_key" ON "redefinicoes_senha"("tokenHash");

-- CreateIndex
CREATE INDEX "redefinicoes_senha_userId_idx" ON "redefinicoes_senha"("userId");

-- AddForeignKey
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
