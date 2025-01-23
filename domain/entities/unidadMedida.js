import { AppError } from "../exeptions/AppError.js"

export class UnidadMedida {
    constructor({ nombre, factor_conversion }) {
        if (typeof nombre === "undefined") {
            throw new Error("El nombre es requerido y no puede ser undefined.");
        }
        if (typeof factor_conversion === "undefined") {
            throw new Error("El factor de conversión es requerido y no puede ser undefined.");
        }
        if (factor_conversion <= 0) {
            throw new Error("El factor de conversión debe ser mayor que 0.");
        }

        this.nombre = nombre;
        this.factor_conversion = factor_conversion;
    }
}