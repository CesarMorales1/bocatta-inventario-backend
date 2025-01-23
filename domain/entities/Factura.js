import { AppError } from "../exeptions/AppError.js"

export class Factura {
    constructor({ id_proveedor, id_moneda = 1, fecha_factura, total, estado, observaciones }) {
        console.log(fecha_factura)
        if (typeof id_proveedor === "undefined") {
            throw new Error("El id del proveedor es requerido y no puede ser undefined.");
        }
        if (typeof id_moneda === "undefined") {
            throw new Error("El id de la moneda es requerido y no puede ser undefined.");
        }
        if (typeof total === "undefined") {
            throw new Error("El total es requerido y no puede ser undefined.");
        }
        if (typeof total !== "number") {
            throw new Error("El total debe ser un número válido.");
        }

    // Convertir la fecha a un objeto Date y asegurarse de que tenga un formato válido
    this.fecha_factura = new Date(fecha_factura) || new Date(); // Asigna la fecha actual si es inválida
    if (isNaN(this.fecha_factura.getTime())) {
        throw new Error("La fecha proporcionada es inválida.");
    }
        this.id_proveedor = id_proveedor;
        this.id_moneda = id_moneda;
        this.total = total;
        this.estado = estado ?? true;
        this.observaciones = observaciones ?? "No hay obeservaciones";
    }
}