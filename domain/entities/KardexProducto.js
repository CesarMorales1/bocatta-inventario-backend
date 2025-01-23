export class KardexProducto {
    constructor({ 
        id_producto, 
        tipo_movimiento, 
        cantidad, 
        saldo,
        costo_produccion,
        precio_venta,
        fecha_movimiento,
        referencia,
        observaciones 
    }) {
        if (typeof tipo_movimiento === "undefined") {
            throw new Error("El tipo de movimiento es requerido y no puede ser undefined.");
        }
        if (typeof cantidad === "undefined") {
            throw new Error("La cantidad es requerida y no puede ser undefined.");
        }
        if (typeof saldo === "undefined") {
            throw new Error("El saldo es requerido y no puede ser undefined.");
        }

        this.id_producto = id_producto;
        this.tipo_movimiento = tipo_movimiento;
        this.cantidad = cantidad;
        this.saldo = saldo;
        this.costo_produccion = costo_produccion;
        this.precio_venta = precio_venta;
        this.fecha_movimiento = fecha_movimiento || new Date();
        this.referencia = referencia;
        this.observaciones = observaciones;
    }
}