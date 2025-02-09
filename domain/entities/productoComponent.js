export class ProductoComponent{
    constructor({nombre,precio_venta,precio_produccion,stock_actual,codigo_barras})
    {
        if(typeof nombre === 'undefined') { throw new Error('nombre no puede ser undefined.'); }
        if(typeof precio_venta === 'undefined') { throw new Error('precio_venta no puede ser undefined.'); }
        if(typeof precio_produccion === 'undefined') { throw new Error('precio_produccion no puede ser undefined.'); }
        if(typeof stock_actual === 'undefined') { throw new Error('stock_actual no puede ser undefined.'); }
        if(typeof codigo_barras === 'undefined') { throw new Error('codigo_barras no puede ser undefined.'); }
        
        this.nombre = nombre;
        this.precio_venta = precio_venta;
        this.precio_produccion = precio_produccion;
        this.stock_actual = stock_actual;
        this.codigo_barras = codigo_barras;
    }
}