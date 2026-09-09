-- AlterTable
ALTER TABLE "render_jobs" ADD COLUMN     "canal" "SaidaCanal";

-- AlterTable
ALTER TABLE "saidas_entrega" ADD COLUMN     "imagemStatus" "RenderJobStatus" NOT NULL DEFAULT 'pendente';
