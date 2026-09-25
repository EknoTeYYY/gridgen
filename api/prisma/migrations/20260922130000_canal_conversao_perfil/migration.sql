-- Canal de conversão real do negócio, capturado uma vez no chat de contexto
-- e reaproveitado nos CTAs gerados (doc editorial, ver packages/shared/src/types/conversao.ts).
ALTER TABLE "perfis" ADD COLUMN "canalConversaoTipo" TEXT;
ALTER TABLE "perfis" ADD COLUMN "canalConversaoConfirmado" BOOLEAN NOT NULL DEFAULT false;
