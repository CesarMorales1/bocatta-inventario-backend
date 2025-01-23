/*
  Warnings:

  - You are about to alter the column `factor_conversion` on the `unidadesmedida` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,6)` to `Decimal(13,6)`.

*/
-- AlterTable
ALTER TABLE "inventario"."unidadesmedida" ALTER COLUMN "factor_conversion" SET DATA TYPE DECIMAL(13,6);
