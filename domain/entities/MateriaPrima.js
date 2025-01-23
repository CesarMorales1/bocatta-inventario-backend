export class MateriaPrima
{
    constructor({nombre,unidad_medida_id = 1,costo_unitario = 1,codigo_barras,disponible = true,stock_actual = 0,presentacion = 1})
    {
        if (typeof nombre === 'undefined') { throw new Error('nombre no puede ser undefined.'); } 
        if (typeof unidad_medida_id === 'undefined') { throw new Error('unidad_medida_id no puede ser undefined.'); } 
        if (typeof costo_unitario === 'undefined') { throw new Error('costo_unitario no puede ser undefined.'); } 
        if (typeof codigo_barras === 'undefined') { throw new Error('codigo_barras no puede ser undefined.'); } 
        if (typeof disponible === 'undefined') { throw new Error('disponible no puede ser undefined.'); }
        if (typeof presentacion === 'undefined') { throw new Error('disponible no puede ser undefined.'); }
        
        this.nombre           = nombre;
        this.unidad_medida_id = Number(unidad_medida_id);
        this.costo_unitario   = costo_unitario;
        this.codigo_barras    = codigo_barras;
        this.disponible       = disponible;
        this.fecha_registro   = new Date;
        this.stock_actual     = stock_actual;
        this.presentacion     = presentacion;
    }
}