import { ProductoComponent } from "./productoComponent.js"

export class ProductoEspecial
{
    constructor({id_producto,rendimiento,unidad_rendimiento})
    {
        this.id_producto = id_producto;
        this.rendimiento = rendimiento;
        this.unidad_rendimiento = unidad_rendimiento;
    }
}