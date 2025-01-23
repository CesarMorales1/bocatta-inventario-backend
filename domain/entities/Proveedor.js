import {AppError} from "../exeptions/AppError.js"
export class Proveedor {
    constructor({ nombre, telefono, direccion,contacto,empresa_nombre,rif }) {
        console.log(rif)
        if (typeof nombre === "undefined") {
            throw new Error("El nombre es requerido y no puede ser undefined.");
        }
        if(typeof rif === "undefined")
            {
                throw new Error("El rif es requerido y no puede ser undefined")
            }
        if (typeof telefono === "undefined") {
            throw new Error("El teléfono es requerido y no puede ser undefined.");
        }
        if (typeof direccion === "undefined") {
            throw new Error("La dirección es requerida y no puede ser undefined.");
        }
        if(typeof contacto === "undefined")
            {
                throw new Error("El contacto es requerido y no puede ser undefined")
            }
        if(typeof empresa_nombre === "undefined")
            {
                throw new Error('El nombre de la empresa no puede ser undefined')
            }

        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
        this.fecha_registro = new Date;
        this.empresa_nombre = empresa_nombre;
        this.rif = rif.toString();
        this.contacto = contacto;
    }
}
