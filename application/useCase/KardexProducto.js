import { KardexProducto } from "../../domain/entities/KardexProducto.js";
import { AppError } from "../../domain/exeptions/AppError.js";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";

export class KardexProductoUseCase {
    constructor({ database }) {
        this.database = database;
    }

    async procesarArchivoVentas(ventasData) {
        try {
            const fechaMovimiento = new Date(ventasData.fecha_movimiento);
    
            // Validar datos de entrada
            if (!Array.isArray(ventasData.products) || ventasData.products.length === 0) {
                throw new AppError('InvalidInput', 400, 'Se esperaba un array de productos no vacío', true);
            }
    
            // Iterar sobre cada producto en ventasData
            for (const product of ventasData.products) {
                const nombreArchivo = ventasData.reference;
    
                // Buscar registros existentes que compartan el mismo nombre de archivo en la referencia
                const registrosExistentes = await this.database.kardex_productos.findMany({
                    where: {
                        id_producto: product.id_producto,
                        referencia: nombreArchivo
                    }
                });
    
                // Obtener producto actual
                const producto = await this.database.productos_terminados.findUnique({
                    where: { id_producto: product.id_producto }
                });
    
                if (!producto) {
                    throw new AppError('NotFound', 404, 'Producto no encontrado', true);
                }
    
                // Calcular el nuevo saldo restando la cantidad vendida del stock actual
                const nuevoSaldo = Number(producto.stock_actual) - Number(product.cantidad);
    
                // Iniciar transacción
                await this.database.$transaction(async (prisma) => {
                    if (registrosExistentes.length > 0) {
                        const registroMismaReferencia = registrosExistentes.find(
                            reg => reg.referencia === ventasData.reference
                        );
    
                        if (registroMismaReferencia) {
                            const cantidadExistente = Number(registroMismaReferencia.cantidad);
                            const nuevaCantidad = Number(product.cantidad);
    
                            if (nuevaCantidad !== cantidadExistente) {
                                // Calcular la diferencia en la cantidad
                                const diferenciaCantidad = nuevaCantidad - cantidadExistente;
    
                                // Procesar solo las recetas del producto que cambió
                                await this.procesarRecetasYActualizarStock(
                                    prisma,
                                    product,
                                    producto,
                                    diferenciaCantidad, // Solo la diferencia
                                    ventasData,
                                    fechaMovimiento
                                );
    
                                // Actualizar el registro en kardex_productos
                                await prisma.kardex_productos.update({
                                    where: { id_kardex: registroMismaReferencia.id_kardex },
                                    data: {
                                        cantidad: nuevaCantidad,
                                        saldo: nuevoSaldo,
                                        observaciones: `Actualizado por diferencia en cantidad: ${diferenciaCantidad}`,
                                        fecha_movimiento: fechaMovimiento
                                    }
                                });
                            }
                        }
                    } else {
                        // Si no hay registros existentes, crear uno nuevo
                        await this.procesarRecetasYActualizarStock(
                            prisma,
                            product,
                            producto,
                            product.cantidad, // Cantidad total
                            ventasData,
                            fechaMovimiento
                        );
    
                        await prisma.kardex_productos.create({
                            data: {
                                id_producto: product.id_producto,
                                tipo_movimiento: "SALIDA",
                                cantidad: product.cantidad,
                                saldo: nuevoSaldo,
                                costo_produccion: product.precio_produccion,
                                precio_venta: product.precio_venta,
                                referencia: ventasData.reference,
                                observaciones: `Salida de producto: ${product.nombre}`,
                                fecha_movimiento: fechaMovimiento
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async procesarRecetasYActualizarStock(prisma, product, producto, cantidad, ventasData, fechaMovimiento) {
        const recetas = await prisma.recetas.findMany({
            where: {
                id_producto: product.id_producto,
                disponible: true
            },
            include: {
                materia_prima: true
            }
        });
    
        // Crear un arreglo para almacenar los productos que consumen la materia prima
        const productosConsumidos = [];
    
        for (const receta of recetas) {
            const cantidadRequerida = this.calcularCantidadEnGramos(
                Number(receta.cantidad_requerida),
                receta.unidad_medida
            ) * Number(cantidad);
    
            const materiaPrima = await prisma.materia_prima.findUnique({
                where: { id_materia_prima: receta.id_materia_prima }
            });
    
            if (!materiaPrima) {
                throw new AppError('NotFound', 404, `Materia prima ${receta.id_materia_prima} no encontrada`, true);
            }
    
            // Calcular nuevo stock permitiendo valores negativos
            const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - Number(cantidadRequerida);
    
            // Actualizar stock de materia prima
            await prisma.materia_prima.update({
                where: { id_materia_prima: receta.id_materia_prima },
                data: { stock_actual: nuevoStockMateriaPrima }
            });
    
            // Agregar el producto al arreglo de productos consumidos
            productosConsumidos.push({
                producto: producto.nombre,
                cantidad: cantidadRequerida
            });
    
            // Verificar si ya hay un registro en kardex_materia_prima para la misma fecha y materia prima
            const kardexMateriaPrima = await prisma.kardex_materia_prima.findFirst({
                where: {
                    id_materia_prima: receta.id_materia_prima,
                    fecha_movimiento: fechaMovimiento
                }
            });
    
            if (kardexMateriaPrima) {
                // Si existe, actualizar el registro existente sumando la cantidad
                await prisma.kardex_materia_prima.update({
                    where: { id_kardex: kardexMateriaPrima.id_kardex },
                    data: {
                        cantidad: {
                            increment: cantidadRequerida // Sumar la nueva cantidad a la existente
                        },
                        saldo: nuevoStockMateriaPrima,
                        costo_total: {
                            increment: Number(materiaPrima.costo_unitario) * Number(cantidadRequerida) // Sumar al costo total
                        },
                        observaciones: JSON.stringify(productosConsumidos) // Guardar el arreglo de productos consumidos
                    }
                });
            } else {
                // Si no existe, crear un nuevo registro
                await prisma.kardex_materia_prima.create({
                    data: {
                        id_materia_prima: receta.id_materia_prima,
                        tipo_movimiento: "SALIDA",
                        cantidad: cantidadRequerida,
                        saldo: nuevoStockMateriaPrima,
                        costo_unitario: materiaPrima.costo_unitario,
                        costo_total: Number(materiaPrima.costo_unitario) * Number(cantidadRequerida),
                        referencia: ventasData.reference,
                        observaciones: JSON.stringify(productosConsumidos), // Guardar el arreglo de productos consumidos
                        fecha_movimiento: fechaMovimiento
                    }
                });
            }
        }
    }
    

    async actualizarStockYRegistrar(ventasData, cantidad, idKardex, isUpdate, cantidadAQuitarReceta) {
        // Verificar si ventasData es un array
        if (!Array.isArray(ventasData.products)) {
            throw new AppError('InvalidInput', 400, 'Se esperaba un array de productos', true);
        }

        // Iniciar transacción
        return await this.database.$transaction(async (prisma) => {
            const resultados = [];

            // Iterar sobre cada producto
            for (const product of ventasData.products) {
                const producto = await prisma.productos_terminados.findUnique({
                    where: { id_producto: product.id_producto }
                });

                if (!producto) {
                    resultados.push({
                        id_producto: product.id_producto,
                        success: false,
                        message: 'Producto no encontrado'
                    });
                    continue; // Saltar al siguiente producto
                }

                // Calcular nuevo saldo permitiendo valores negativos
                const nuevoSaldo = Number(producto.stock_actual) - Number(product.cantidad);

                // Actualizar stock del producto
                await prisma.productos_terminados.update({
                    where: { id_producto: product.id_producto },
                    data: { stock_actual: nuevoSaldo }
                });

                // Obtener las recetas del producto
                const recetas = await prisma.recetas.findMany({
                    where: {
                        id_producto: product.id_producto,
                        disponible: true
                    },
                    include: {
                        materia_prima: true
                    }
                });

                // Procesar cada materia prima de la receta
                for (const receta of recetas) {
                    const cantidadRequerida = this.calcularCantidadEnGramos(
                        Number(receta.cantidad_requerida),
                        receta.unidad_medida
                    ) * Number(product.cantidad);

                    const materiaPrima = await prisma.materia_prima.findUnique({
                        where: { id_materia_prima: receta.id_materia_prima }
                    });

                    if (!materiaPrima) {
                        resultados.push({
                            id_producto: product.id_producto,
                            success: false,
                            message: `Materia prima ${receta.id_materia_prima} no encontrada`
                        });
                        continue; // Saltar al siguiente producto
                    }

                    // Calcular nuevo stock permitiendo valores negativos
                    const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - Number(cantidadRequerida);

                    // Actualizar stock de materia prima
                    await prisma.materia_prima.update({
                        where: { id_materia_prima: receta.id_materia_prima },
                        data: { stock_actual: nuevoStockMateriaPrima }
                    });

                    // Registrar movimiento en kardex_materia_prima
                    await prisma.kardex_materia_prima.create({
                        data: {
                            id_materia_prima: receta.id_materia_prima,
                            tipo_movimiento: "SALIDA",
                            cantidad: cantidadRequerida,
                            saldo: nuevoStockMateriaPrima,
                            costo_unitario: materiaPrima.costo_unitario,
                            costo_total: Number(cantidadRequerida) * Number(materiaPrima.costo_unitario),
                            referencia: `Venta de producto: ${producto.nombre}, Cantidad: ${cantidadRequerida} gramos`,
                            observaciones: `Descuento de stock por venta. Cantidad: ${cantidadRequerida} gramos`,
                            fecha_movimiento: ventasData.fecha_movimiento // Usar la fecha original
                        }
                    });
                }

                // Registrar movimiento en kardex_productos
                if (isUpdate) {
                    await prisma.kardex_productos.update({
                        where: { id_kardex: idKardex },
                        data: {
                            cantidad: Number(product.cantidad),
                            saldo: nuevoSaldo,
                            observaciones: `Actualizado por diferencia en cantidad: ${product.cantidad}`,
                            fecha_movimiento: ventasData.fecha_movimiento // Usar la fecha original
                        }
                    });
                    resultados.push({
                        id_producto: product.id_producto,
                        success: true,
                        message: 'Registro actualizado con la nueva cantidad',
                        referencia: ventasData.reference
                    });
                } else {
                    await prisma.kardex_productos.create({
                        data: {
                            id_producto: product.id_producto,
                            tipo_movimiento: "SALIDA",
                            cantidad: Number(product.cantidad),
                            saldo: nuevoSaldo,
                            costo_produccion: ventasData.costo_produccion,
                            precio_venta: ventasData.precio_venta,
                            referencia: ventasData.reference,
                            observaciones: `Salida de producto: ${producto.nombre}`,
                            fecha_movimiento: ventasData.fecha_movimiento // Usar la fecha original
                        }
                    });
                    resultados.push({
                        id_producto: product.id_producto,
                        success: true,
                        message: 'Nuevo registro de kardex creado exitosamente',
                        referencia: ventasData.reference
                    });
                }
            }

            return resultados; // Retornar un resumen de las operaciones
        });
    }

    async createOne(kardexData) {
        try {
            const kardexProducto = new KardexProducto(kardexData);

            // Verificar si el producto existe
            const producto = await this.database.productos_terminados.findUnique({
                where: { id_producto: kardexProducto.id_producto }
            });

            if (!producto) {
                throw new AppError('NotFound', 404, 'El producto no existe', true);
            }

            // Calcular nuevo saldo permitiendo valores negativos
            const nuevoSaldo = kardexProducto.tipo_movimiento === 'ENTRADA'
                ? Number(producto.stock_actual) + Number(kardexProducto.cantidad)
                : Number(producto.stock_actual) - Number(kardexProducto.cantidad);

            // Iniciar transacción
            return await this.database.$transaction(async (prisma) => {
                // Actualizar stock del producto - permitir valores negativos
                await prisma.productos_terminados.update({
                    where: { id_producto: kardexProducto.id_producto },
                    data: { stock_actual: nuevoSaldo }
                });

                // Si es una salida, procesar la receta
                if (kardexProducto.tipo_movimiento === 'SALIDA') {
                    const recetas = await prisma.recetas.findMany({
                        where: {
                            id_producto: kardexProducto.id_producto,
                            disponible: true
                        },
                        include: {
                            materia_prima: true
                        }
                    });

                    // Procesar cada materia prima de la receta
                    for (const receta of recetas) {
                        const cantidadRequerida = this.calcularCantidadEnGramos(
                            Number(receta.cantidad_requerida),
                            receta.unidad_medida
                        ) * Number(kardexProducto.cantidad);

                        const materiaPrima = await prisma.materia_prima.findUnique({
                            where: { id_materia_prima: receta.id_materia_prima }
                        });

                        if (!materiaPrima) {
                            throw new AppError('NotFound', 404, `Materia prima ${receta.id_materia_prima} no encontrada`, true);
                        }

                        const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - cantidadRequerida;

                        // Actualizar stock de materia prima
                        await prisma.materia_prima.update({
                            where: { id_materia_prima: receta.id_materia_prima },
                            data: { stock_actual: nuevoStockMateriaPrima }
                        });

                        // Registrar movimiento en kardex_materia_prima
                        await prisma.kardex_materia_prima.create({
                            data: {
                                id_materia_prima: receta.id_materia_prima,
                                tipo_movimiento: "SALIDA",
                                cantidad: cantidadRequerida,
                                saldo: nuevoStockMateriaPrima,
                                costo_unitario: materiaPrima.costo_unitario,
                                costo_total: Number(cantidadRequerida) * Number(materiaPrima.costo_unitario),
                                referencia: `Producción: ${producto.nombre}`,
                                observaciones: `Descuento de stock por producción. Cantidad: ${cantidadRequerida} gramos`
                            }
                        });
                    }
                }

                // Crear el registro en kardex_productos
                const result = await prisma.kardex_productos.create({
                    data: {
                        id_producto: kardexProducto.id_producto,
                        tipo_movimiento: kardexProducto.tipo_movimiento,
                        cantidad: kardexProducto.cantidad,
                        saldo: nuevoSaldo,
                        costo_produccion: kardexProducto.costo_produccion,
                        precio_venta: kardexProducto.precio_venta,
                        fecha_movimiento: kardexProducto.fecha_movimiento,
                        referencia: kardexProducto.referencia,
                        observaciones: kardexProducto.observaciones
                    }
                });

                return result;
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw handlePrismaError(error);
        }
    }

    async getAll() {
        try {
            const kardexProductos = await this.database.kardex_productos.findMany({
                include: {
                    productos_terminados: true
                }
            });
            return kardexProductos;
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    async getByProductId(id_producto) {
        try {
            const kardexProductos = await this.database.kardex_productos.findMany({
                where: {
                    id_producto: parseInt(id_producto)
                },
                include: {
                    productos_terminados: true
                },
                orderBy: {
                    fecha_movimiento: 'desc'
                }
            });
            return kardexProductos;
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    async getOne(id_kardex) {
        try {
            const kardexProducto = await this.database.kardex_productos.findUnique({
                where: {
                    id_kardex: parseInt(id_kardex)
                },
                include: {
                    productos_terminados: true
                }
            });
            return kardexProducto;
        } catch (error) {
            throw handlePrismaError(error);
        }
    }

    async obtenerKardexPorReferencia(referencia) {
        try {
            const kardex = await this.database.kardex_productos.findFirst({
                where: {
                    referencia: referencia
                },
                include: {
                    productos_terminados: true
                }
            });
            return kardex;
        } catch (error) {
            console.log(error);
            throw handlePrismaError(error);
        }
    }

    calcularCantidadEnGramos(cantidad, unidadMedida) {
        // Si la unidad de medida es kilos (2), convertir a gramos
        if (unidadMedida === 2) {
            return cantidad * 1000;
        }
        // Si ya está en gramos (1) o cualquier otra unidad, mantener la cantidad
        return cantidad;
    }
}