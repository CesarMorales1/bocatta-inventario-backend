export class Moneda {
    constructor({ nombre, tasa_cambio }) {
        if (typeof nombre === "undefined") {
            throw new Error("El nombre es requerido y no puede ser undefined.");
        }
        if (typeof tasa_cambio === "undefined") {
            throw new Error("La tasa de cambio es requerida y no puede ser undefined.");
        }
        if (tasa_cambio <= 0) {
            throw new Error("La tasa de cambio debe ser mayor que 0.");
        }

        this.nombre = nombre;
        this.tasa_cambio = tasa_cambio;
    }
}