-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventario";

-- CreateTable
CREATE TABLE "inventario"."detalle_factura" (
    "id_detalle" SERIAL NOT NULL,
    "id_factura" INTEGER,
    "id_materia_prima" INTEGER,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2),
    "unidad_medida" INTEGER,

    CONSTRAINT "detalle_factura_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "inventario"."facturas" (
    "id_factura" SERIAL NOT NULL,
    "id_proveedor" INTEGER,
    "id_moneda" INTEGER NOT NULL,
    "fecha_factura" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" BOOLEAN DEFAULT true,
    "observaciones" TEXT,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "inventario"."ConversionFactor" (
    "id" SERIAL NOT NULL,
    "unidadOrigen" TEXT NOT NULL,
    "unidadDestino" TEXT NOT NULL,
    "factorConversion" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConversionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario"."kardex_materia_prima" (
    "id_kardex" SERIAL NOT NULL,
    "id_materia_prima" INTEGER,
    "tipo_movimiento" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "saldo" DECIMAL(10,2) NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "costo_total" DECIMAL(10,2) NOT NULL,
    "fecha_movimiento" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "referencia" VARCHAR(100),
    "observaciones" TEXT,

    CONSTRAINT "kardex_materia_prima_pkey" PRIMARY KEY ("id_kardex")
);

-- CreateTable
CREATE TABLE "inventario"."kardex_productos" (
    "id_kardex" SERIAL NOT NULL,
    "id_producto" INTEGER,
    "tipo_movimiento" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "saldo" DECIMAL(10,2) NOT NULL,
    "costo_produccion" DECIMAL(10,2),
    "precio_venta" DECIMAL(10,2),
    "fecha_movimiento" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "referencia" VARCHAR(100),
    "referencias_archivos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observaciones" TEXT,

    CONSTRAINT "kardex_productos_pkey" PRIMARY KEY ("id_kardex")
);

-- CreateTable
CREATE TABLE "inventario"."materia_prima" (
    "id_materia_prima" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "unidad_medida_id" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "presentacion" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "stock_actual" DECIMAL(10,2) DEFAULT 0,
    "codigo_barras" VARCHAR(100) NOT NULL,
    "fecha_registro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id_materia_prima")
);

-- CreateTable
CREATE TABLE "inventario"."monedas" (
    "id_moneda" SERIAL NOT NULL,
    "nombre" VARCHAR NOT NULL,
    "tasa_cambio" DECIMAL(10,6) NOT NULL,

    CONSTRAINT "monedas_pkey" PRIMARY KEY ("id_moneda")
);

-- CreateTable
CREATE TABLE "inventario"."productos_terminados" (
    "id_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "stock_actual" DECIMAL(10,2) DEFAULT 0,
    "codigo_barras" TEXT NOT NULL,
    "precio_produccion" INTEGER NOT NULL,
    "id_moneda" INTEGER NOT NULL,
    "id_producto_especial" INTEGER,

    CONSTRAINT "productos_terminados_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "inventario"."productos_especiales" (
    "id_producto_especial" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "rendimiento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unidad_rendimiento" INTEGER,

    CONSTRAINT "productos_especiales_pkey" PRIMARY KEY ("id_producto_especial")
);

-- CreateTable
CREATE TABLE "inventario"."proveedores" (
    "id_proveedor" SERIAL NOT NULL,
    "rif" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "contacto" VARCHAR(100),
    "telefono" VARCHAR(15),
    "direccion" TEXT,
    "empresa_nombre" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "inventario"."recetas" (
    "id_receta" SERIAL NOT NULL,
    "id_producto" INTEGER,
    "id_materia_prima" INTEGER,
    "id_producto_especial" INTEGER,
    "cantidad_requerida" DECIMAL(10,2) NOT NULL,
    "unidad_medida" INTEGER,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id_receta")
);

-- CreateTable
CREATE TABLE "inventario"."unidadesmedida" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR NOT NULL,
    "factor_conversion" DECIMAL(13,6) NOT NULL,

    CONSTRAINT "unidadesmedida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversionFactor_unidadOrigen_unidadDestino_key" ON "inventario"."ConversionFactor"("unidadOrigen", "unidadDestino");

-- CreateIndex
CREATE UNIQUE INDEX "materia_prima_codigo_barras_key" ON "inventario"."materia_prima"("codigo_barras");

-- CreateIndex
CREATE INDEX "idx_unidad_medida" ON "inventario"."materia_prima"("unidad_medida_id");

-- CreateIndex
CREATE UNIQUE INDEX "productos_terminados_id_producto_especial_key" ON "inventario"."productos_terminados"("id_producto_especial");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_rif_key" ON "inventario"."proveedores"("rif");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_empresa_nombre_key" ON "inventario"."proveedores"("empresa_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidadesmedida_nombre_key" ON "inventario"."unidadesmedida"("nombre");

-- AddForeignKey
ALTER TABLE "inventario"."detalle_factura" ADD CONSTRAINT "detalle_factura_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "inventario"."facturas"("id_factura") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."detalle_factura" ADD CONSTRAINT "detalle_factura_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "inventario"."materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."detalle_factura" ADD CONSTRAINT "detalle_factura_unidad_medida_fkey" FOREIGN KEY ("unidad_medida") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."facturas" ADD CONSTRAINT "facturas_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "inventario"."monedas"("id_moneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."facturas" ADD CONSTRAINT "facturas_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "inventario"."proveedores"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."kardex_materia_prima" ADD CONSTRAINT "kardex_materia_prima_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "inventario"."materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."kardex_productos" ADD CONSTRAINT "kardex_productos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "inventario"."productos_terminados"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."materia_prima" ADD CONSTRAINT "materia_prima_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."productos_terminados" ADD CONSTRAINT "productos_terminados_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "inventario"."monedas"("id_moneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."productos_terminados" ADD CONSTRAINT "productos_terminados_id_producto_especial_fkey" FOREIGN KEY ("id_producto_especial") REFERENCES "inventario"."productos_especiales"("id_producto_especial") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."productos_especiales" ADD CONSTRAINT "productos_especiales_unidad_rendimiento_fkey" FOREIGN KEY ("unidad_rendimiento") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "fk_recetas_unidad_medida" FOREIGN KEY ("unidad_medida") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "recetas_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "inventario"."materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "recetas_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "inventario"."productos_terminados"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "recetas_id_producto_especial_fkey" FOREIGN KEY ("id_producto_especial") REFERENCES "inventario"."productos_especiales"("id_producto_especial") ON DELETE NO ACTION ON UPDATE NO ACTION;
