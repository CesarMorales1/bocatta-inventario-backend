import { AppError } from "../exeptions/AppError.js"

export class ProductoTerminado {
    constructor({ nombre, precio_venta, precio_produccion, id_moneda, stock_actual,codigo_barras }) {
        if (!nombre) {
            throw new Error("El nombre es requerido.");
        }
        if (typeof precio_venta === "undefined") {
            throw new Error("El precio de venta es requerido.");
        }
        if (typeof precio_produccion === "undefined") {
            throw new Error("El precio de producción es requerido.");
        }
        if (typeof id_moneda === "undefined") {
            throw new Error("El ID de la moneda es requerido.");
        }
        if (typeof codigo_barras === "undefined")
            {
                throw new Error('el codigo de barras es requerido');
            }

        this.nombre = nombre;
        this.precio_venta = precio_venta;
        this.precio_produccion = precio_produccion;
        this.id_moneda = id_moneda;
        this.stock_actual = stock_actual || 0;
        this.codigo_barras = codigo_barras;
    }
}