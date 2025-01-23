/*
  Warnings:

  - You are about to drop the column `unidad_medida` on the `materia_prima` table. All the data in the column will be lost.
  - Added the required column `unidad_medida_id` to the `materia_prima` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventario"."materia_prima" DROP COLUMN "unidad_medida",
ADD COLUMN     "unidad_medida_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "idx_unidad_medida" ON "inventario"."materia_prima"("unidad_medida_id");

-- AddForeignKey
ALTER TABLE "inventario"."materia_prima" ADD CONSTRAINT "materia_prima_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
