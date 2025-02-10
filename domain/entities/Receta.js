export class Receta {
    constructor({ id_materia_prima, cantidad_requerida, unidad_medida }) {
        if (typeof id_materia_prima === "undefined") {
            throw new Error("El ID de la materia prima es requerido.");
        }
        if (typeof cantidad_requerida === "undefined") {
            throw new Error("La cantidad requerida es requerida.");
        }
        if (typeof unidad_medida === "undefined") {
            throw new Error("La unidad de medida es requerida.");
        }

        this.id_materia_prima = id_materia_prima;
        this.cantidad_requerida = cantidad_requerida;
        this.unidad_medida = unidad_medida;
        this.disponible = true;
    }
}
