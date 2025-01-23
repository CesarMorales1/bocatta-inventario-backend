/*
  Warnings:

  - A unique constraint covering the columns `[codigo_barras]` on the table `materia_prima` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "materia_prima_codigo_barras_key" ON "inventario"."materia_prima"("codigo_barras");
