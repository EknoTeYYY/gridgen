-- AlterEnum
BEGIN;
CREATE TYPE "SaidaCanal_new" AS ENUM ('instagram', 'linkedin', 'tiktok');
ALTER TABLE "saidas_entrega" ALTER COLUMN "canal" TYPE "SaidaCanal_new" USING ("canal"::text::"SaidaCanal_new");
ALTER TYPE "SaidaCanal" RENAME TO "SaidaCanal_old";
ALTER TYPE "SaidaCanal_new" RENAME TO "SaidaCanal";
DROP TYPE "SaidaCanal_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "drive_connections" DROP CONSTRAINT "drive_connections_conectadoPorUserId_fkey";

-- DropForeignKey
ALTER TABLE "drive_connections" DROP CONSTRAINT "drive_connections_contaId_fkey";

-- DropTable
DROP TABLE "drive_connections";
