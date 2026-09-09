-- CreateEnum
CREATE TYPE "PerfilTipo" AS ENUM ('empresa', 'pessoal');

-- CreateEnum
CREATE TYPE "PostTipo" AS ENUM ('ancora', 'dor', 'prova', 'didatico', 'dado', 'oferta');

-- CreateEnum
CREATE TYPE "PostFormato" AS ENUM ('feed', 'square', 'story');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('rascunho', 'gerando', 'pronto', 'entregue', 'erro');

-- CreateEnum
CREATE TYPE "RenderJobStatus" AS ENUM ('pendente', 'processando', 'concluido', 'erro');

-- CreateEnum
CREATE TYPE "SaidaCanal" AS ENUM ('drive', 'instagram', 'linkedin', 'tiktok');

-- CreateEnum
CREATE TYPE "SaidaStatus" AS ENUM ('pendente', 'enviado', 'erro', 'indisponivel');

-- CreateEnum
CREATE TYPE "ContextoRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "contas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'trial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'owner',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "PerfilTipo" NOT NULL DEFAULT 'empresa',
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "corPrimaria" TEXT NOT NULL DEFAULT '#8b5cf6',
    "corSecundaria" TEXT NOT NULL DEFAULT '#3b82f6',
    "corFundo" TEXT NOT NULL DEFAULT '#0b0a14',
    "corTexto" TEXT NOT NULL DEFAULT '#f1effa',
    "fonte" TEXT NOT NULL DEFAULT 'poppins-inter',
    "logoColorUrl" TEXT,
    "logoBrancoUrl" TEXT,
    "iconeColorUrl" TEXT,
    "iconeBrancoUrl" TEXT,
    "lockupTag" TEXT,
    "url" TEXT,
    "temaPadrao" TEXT NOT NULL DEFAULT 'ink',

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contexto_markdown" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "conteudoMarkdown" TEXT NOT NULL DEFAULT '',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contexto_markdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_contexto" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "role" "ContextoRole" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_contexto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "tipo" "PostTipo" NOT NULL,
    "formato" "PostFormato" NOT NULL DEFAULT 'feed',
    "slug" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '',
    "slides" JSONB NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'rascunho',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "render_jobs" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "status" "RenderJobStatus" NOT NULL DEFAULT 'pendente',
    "erroMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "render_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saidas_entrega" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "canal" "SaidaCanal" NOT NULL,
    "status" "SaidaStatus" NOT NULL DEFAULT 'pendente',
    "refExterna" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saidas_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_connections" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "conectadoPorUserId" TEXT NOT NULL,
    "googleRefreshToken" TEXT NOT NULL,
    "googleEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contas_slug_key" ON "contas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_contaId_idx" ON "users"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "perfis_contaId_idx" ON "perfis"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_contaId_slug_key" ON "perfis"("contaId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "contexto_markdown_perfilId_key" ON "contexto_markdown"("perfilId");

-- CreateIndex
CREATE INDEX "mensagens_contexto_perfilId_idx" ON "mensagens_contexto"("perfilId");

-- CreateIndex
CREATE INDEX "posts_perfilId_idx" ON "posts"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_perfilId_slug_key" ON "posts"("perfilId", "slug");

-- CreateIndex
CREATE INDEX "render_jobs_postId_idx" ON "render_jobs"("postId");

-- CreateIndex
CREATE INDEX "saidas_entrega_postId_idx" ON "saidas_entrega"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "drive_connections_contaId_key" ON "drive_connections"("contaId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis" ADD CONSTRAINT "perfis_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contexto_markdown" ADD CONSTRAINT "contexto_markdown_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_contexto" ADD CONSTRAINT "mensagens_contexto_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saidas_entrega" ADD CONSTRAINT "saidas_entrega_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_conectadoPorUserId_fkey" FOREIGN KEY ("conectadoPorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
