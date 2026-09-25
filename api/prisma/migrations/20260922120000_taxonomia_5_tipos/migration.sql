-- Taxonomia editorial (Ellen/marketing): PostTipo passa de 6 valores
-- (ancora/dor/prova/didatico/dado/oferta) pros 5 novos
-- (educativo/conexao/prova_social/produtos_servicos/interativo).
-- Remapeia dados existentes em vez de descartar (nenhum post real é
-- perdido) — ver packages/shared/src/types/post.ts pro racional de cada
-- mapeamento. "prova" (antigo portfólio multi-foto) vai pra
-- "produtos_servicos", nunca "prova_social" — a receita nova de Prova
-- Social (1 slide, print de depoimento real) é estruturalmente
-- incompatível com o carrossel antigo de portfólio.
BEGIN;

CREATE TYPE "PostTipo_new" AS ENUM ('educativo', 'conexao', 'prova_social', 'produtos_servicos', 'interativo');

ALTER TABLE "posts" ALTER COLUMN "tipo" TYPE "PostTipo_new" USING (
  CASE "tipo"::text
    WHEN 'didatico' THEN 'educativo'
    WHEN 'dado' THEN 'educativo'
    WHEN 'dor' THEN 'conexao'
    WHEN 'ancora' THEN 'conexao'
    WHEN 'oferta' THEN 'produtos_servicos'
    WHEN 'prova' THEN 'produtos_servicos'
  END::"PostTipo_new"
);

ALTER TABLE "datas_personalizadas" ALTER COLUMN "tipoSugerido" DROP DEFAULT;
ALTER TABLE "datas_personalizadas" ALTER COLUMN "tipoSugerido" TYPE "PostTipo_new" USING (
  CASE "tipoSugerido"::text
    WHEN 'didatico' THEN 'educativo'
    WHEN 'dado' THEN 'educativo'
    WHEN 'dor' THEN 'conexao'
    WHEN 'ancora' THEN 'conexao'
    WHEN 'oferta' THEN 'produtos_servicos'
    WHEN 'prova' THEN 'produtos_servicos'
  END::"PostTipo_new"
);

ALTER TYPE "PostTipo" RENAME TO "PostTipo_old";
ALTER TYPE "PostTipo_new" RENAME TO "PostTipo";
DROP TYPE "PostTipo_old";

ALTER TABLE "datas_personalizadas" ALTER COLUMN "tipoSugerido" SET DEFAULT 'produtos_servicos';

COMMIT;
