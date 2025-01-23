export class Ingrediente
{
    constructor({codigo_barras,nombre,descripcion})
    {
        this.codigo_barras = codigo_barras;
        this.nombre = nombre;
        this.descripcion = descripcion || "";
    }
}