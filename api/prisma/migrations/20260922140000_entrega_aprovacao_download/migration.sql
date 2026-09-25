-- Modelo de entrega/aprovação/download como eventos explícitos (doc
-- editorial §12) — versão, aprovação explícita e log de download.
ALTER TABLE "posts" ADD COLUMN "versao" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "posts" ADD COLUMN "aprovadoEm" TIMESTAMP(3);
ALTER TABLE "posts" ADD COLUMN "aprovadaVersao" INTEGER;

CREATE TABLE "post_download_eventos" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "canal" "SaidaCanal",
    "versao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_download_eventos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "post_download_eventos_postId_idx" ON "post_download_eventos"("postId");

ALTER TABLE "post_download_eventos" ADD CONSTRAINT "post_download_eventos_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
