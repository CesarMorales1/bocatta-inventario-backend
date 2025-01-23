import { AppError } from "../exeptions/AppError.js"

export class DetalleFactura {
    constructor({ id_factura, id_materia_prima, cantidad, precio_unitario, unidad_medida }) {
        if (typeof cantidad === "undefined") {
            throw new Error("La cantidad es requerida y no puede ser undefined.");
        }
        if (typeof precio_unitario === "undefined") {
            throw new Error("El precio unitario es requerido y no puede ser undefined.");
        }
        if (typeof id_materia_prima === "undefined") {
            throw new Error("La materia prima es requerida y no puede ser undefined.");
        }
        if (typeof unidad_medida === "undefined") {
            throw new Error("La unidad de medida es requerida y no puede ser undefined.");
        }

        this.id_factura = id_factura;
        this.id_materia_prima = id_materia_prima;
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
        this.subtotal = cantidad * precio_unitario;
        this.unidad_medida = unidad_medida;
    }
}