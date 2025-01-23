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
    "costo_produccion" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2),
    "fecha_movimiento" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "referencia" VARCHAR(100),
    "observaciones" TEXT,

    CONSTRAINT "kardex_productos_pkey" PRIMARY KEY ("id_kardex")
);

-- CreateTable
CREATE TABLE "inventario"."materia_prima" (
    "id_materia_prima" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "unidad_medida" VARCHAR(50) NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
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
    "precio_produccion" INTEGER NOT NULL,
    "id_moneda" INTEGER NOT NULL,

    CONSTRAINT "productos_terminados_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "inventario"."proveedores" (
    "id_proveedor" SERIAL NOT NULL,
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
    "cantidad_requerida" DECIMAL(10,2) NOT NULL,
    "unidad_medida" INTEGER,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id_receta")
);

-- CreateTable
CREATE TABLE "inventario"."unidadesmedida" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR NOT NULL,
    "factor_conversion" DECIMAL(10,6) NOT NULL,

    CONSTRAINT "unidadesmedida_pkey" PRIMARY KEY ("id")
);

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
ALTER TABLE "inventario"."productos_terminados" ADD CONSTRAINT "productos_terminados_id_moneda_fkey" FOREIGN KEY ("id_moneda") REFERENCES "inventario"."monedas"("id_moneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "fk_recetas_unidad_medida" FOREIGN KEY ("unidad_medida") REFERENCES "inventario"."unidadesmedida"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "recetas_id_materia_prima_fkey" FOREIGN KEY ("id_materia_prima") REFERENCES "inventario"."materia_prima"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventario"."recetas" ADD CONSTRAINT "recetas_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "inventario"."productos_terminados"("id_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;
