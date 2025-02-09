import { KardexProducto } from "../../domain/entities/KardexProducto.js";
import { AppError } from "../../domain/exeptions/AppError.js";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";

export class KardexProductoUseCase {
    constructor({ database }) {
        this.database = database;
    }

    async deleteKardexByDate(date) {
        try {
            const response = await this.database.kardex_productos.deleteMany(
                {
                    where: {fecha_movimiento: date}
                })
            const responseMateriaPrima = await this.database.kardex_materia_prima.deleteMany(
                {
                    where: {fecha_movimiento: date}
                })
            return response;
        } catch (error) {
            console.log(error)
            throw handlePrismaError(error);
        }
    }

    async procesarArchivoVentas(ventasData) {
        try {
            console.log(ventasData);
            if(ventasData.isReprocess)
                {
                    await this.deleteKardexByDate(ventasData.fecha_movimiento);
                }
            const fechaMovimiento = new Date(ventasData.fecha_movimiento);
            const isCreditoFile = /^credito2/.test(ventasData.filename);
            // Generar referencia basada en la fecha (sin hora)
            const fechaBase = fechaMovimiento.toISOString().split('T')[0];
            const referenciaDiaria = btoa(fechaBase);

            // Generar referencia única para el archivo
            const fileReference = `${ventasData.reference}_${isCreditoFile ? 'credito' : 'piso'}`;

            // Iterar sobre cada producto en ventasData
            for (const product of ventasData.products) {
                // Buscar kardex existente para el día
                let kardexExistente = await this.database.kardex_productos.findFirst({
                    where: {
                        id_producto: product.id_producto,
                        referencia: referenciaDiaria
                    }
                });

                const producto = await this.database.productos_terminados.findUnique({
                    where: { id_producto: product.id_producto },
                    include: {
                        producto_especial: true,
                        recetas: {
                            include: {
                                materia_prima: true,
                                productos_especiales: {
                                    include: {
                                        recetas: {
                                            include: {
                                                materia_prima: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                if (!producto) {
                    throw new AppError('NotFound', 404, `Producto no encontrado: ${product.id_producto}`, true);
                }

                // Iniciar transacción
                await this.database.$transaction(async (prisma) => {
                    if (kardexExistente) {
                        // Verificar si este archivo específico ya fue procesado usando la nueva referencia única
                        if (kardexExistente.referencias_archivos.includes(fileReference)) {
                            // console.log(`Archivo ${fileReference} ya fue procesado para este día`);
                            return; // Si el archivo ya fue procesado, no hacer nada
                        }

                        let cantidadTotal = Number(kardexExistente.cantidad);
                        const nuevasReferencias = [...kardexExistente.referencias_archivos];

                        if (isCreditoFile) {
                            // Para archivos de crédito, siempre sumamos
                            cantidadTotal += Number(product.cantidad);
                            nuevasReferencias.push(fileReference);
                        } else {
                            // Para archivos de piso, verificamos si la nueva cantidad es mayor
                            const cantidadPisoActual = kardexExistente.referencias_archivos
                                .filter(ref => ref.includes('_piso'))
                                .length > 0 ? kardexExistente.cantidad : 0;

                            if (Number(product.cantidad) > cantidadPisoActual) {
                                // Si la nueva cantidad es mayor, actualizamos
                                cantidadTotal = Number(product.cantidad) + (kardexExistente.cantidad - cantidadPisoActual);
                                nuevasReferencias.push(fileReference);
                            } else {
                                // console.log(`Cantidad de piso (${product.cantidad}) no es mayor que la actual (${cantidadPisoActual})`);
                                return; // No actualizamos si la cantidad es menor o igual
                            }
                        }

                        // Calcular el nuevo saldo
                        const nuevoSaldo = Number(producto.stock_actual) - (cantidadTotal - Number(kardexExistente.cantidad));

                        // Actualizar el registro existente
                        await prisma.kardex_productos.update({
                            where: { id_kardex: kardexExistente.id_kardex },
                            data: {
                                cantidad: cantidadTotal,
                                saldo: nuevoSaldo,
                                referencias_archivos: nuevasReferencias,
                                observaciones: `Actualizado por archivo ${isCreditoFile ? 'crédito' : 'piso'}: ${fileReference}. Total del día: ${cantidadTotal}`
                            }
                        });

                        // Actualizar stock del producto
                        await prisma.productos_terminados.update({
                            where: { id_producto: product.id_producto },
                            data: { stock_actual: nuevoSaldo }
                        });

                        // Procesar recetas solo si hubo cambio en la cantidad
                        if (cantidadTotal !== kardexExistente.cantidad) {
                            await this.procesarRecetasYActualizarStock(
                                prisma,
                                product,
                                producto,
                                cantidadTotal - Number(kardexExistente.cantidad),
                                ventasData,
                                fechaMovimiento
                            );
                        }
                    } else {
                        // Si no existe registro para ese día, crear uno nuevo
                        const nuevoSaldo = Number(producto.stock_actual) - Number(product.cantidad);

                        await prisma.kardex_productos.create({
                            data: {
                                id_producto: product.id_producto,
                                tipo_movimiento: "SALIDA",
                                cantidad: product.cantidad,
                                saldo: nuevoSaldo,
                                costo_produccion: product.precio_produccion,
                                precio_venta: product.precio_venta,
                                referencia: referenciaDiaria,
                                referencias_archivos: [fileReference],
                                observaciones: `Salida de producto por ${isCreditoFile ? 'crédito' : 'piso'}: ${producto.nombre}`,
                                fecha_movimiento: fechaMovimiento
                            }
                        });

                        // Actualizar stock del producto
                        await prisma.productos_terminados.update({
                            where: { id_producto: product.id_producto },
                            data: { stock_actual: nuevoSaldo }
                        });

                        // Procesar recetas y actualizar kardex de materias primas
                        await this.procesarRecetasYActualizarStock(
                            prisma,
                            product,
                            producto,
                            product.cantidad,
                            ventasData,
                            fechaMovimiento
                        );
                    }
                });
            }

            return { success: true, message: 'Archivo procesado correctamente' };
        } catch (error) {
            console.error('Error en procesarArchivoVentas:', error);
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
                materia_prima: true,
                productos_especiales: {
                    include: {
                        recetas: {
                            include: {
                                materia_prima: true
                            }
                        }
                    }
                }
            }
        });
        // Crear un arreglo para almacenar los productos que consumen la materia prima
        const productosConsumidos = [];

        for (const receta of recetas) {
            const cantidadRequerida = this.calcularCantidadEnGramos(
                Number(receta.cantidad_requerida),
                receta.unidad_medida
            ) * Number(cantidad);
            if (receta.id_materia_prima) {
                // Procesar materia prima normal
                await this.procesarMateriaPrima(
                    prisma,
                    receta.id_materia_prima,
                    cantidadRequerida,
                    producto.nombre,
                    productosConsumidos,
                    ventasData,
                    fechaMovimiento
                );
            } else if (receta.productos_especiales) {
                // Procesar producto especial
                const productoEspecial = receta.productos_especiales
                // Calcular la proporción basada en el rendimiento
                // const proporcion = cantidadRequerida / Number(cantidad);
                // Buscar el producto terminado asociado al producto especial
                const productoTerminadoEspecial = await prisma.productos_terminados.findFirst({
                    where: { id_producto_especial: productoEspecial.id_producto_especial }
                });

                if (productoTerminadoEspecial) {
                    const nuevoSaldoEspecial = Number(productoTerminadoEspecial.stock_actual) - cantidadRequerida;
                    
                    // Actualizar stock del producto especial
                    const productoEspecialDb = await prisma.productos_terminados.update({
                        where: { id_producto: productoTerminadoEspecial.id_producto },
                        data: { stock_actual: nuevoSaldoEspecial }
                    });

                    // Registrar en kardex del producto especial
                    await prisma.kardex_productos.create({
                        data: {
                            id_producto: productoTerminadoEspecial.id_producto,
                            tipo_movimiento: "SALIDA",
                            cantidad: cantidadRequerida,
                            saldo: nuevoSaldoEspecial,
                            costo_produccion: productoTerminadoEspecial.precio_produccion,
                            precio_venta: productoTerminadoEspecial.precio_venta,
                            referencia: ventasData.reference,
                            observaciones: `Consumido como ingrediente en: ${producto.nombre}`,
                            fecha_movimiento: fechaMovimiento
                        }
                    });

                    // Procesar las materias primas del producto especial
                    const recetaOfProductoEspecial = await this.database.recetas.findMany(
                        {
                            where: {id_producto: productoEspecialDb.id_producto}
                        })
                    const rendimientoProductoEspecial = await this.database.productos_especiales.findMany(
                        {
                            where: {id_producto: productoEspecialDb.id_producto},
                            select: {rendimiento: true}
                        })
                    for (const recetaEspecial of recetaOfProductoEspecial) {
                        if (recetaEspecial.id_materia_prima) {

                            const cantidadProporcional = (cantidadRequerida * recetaEspecial.cantidad_requerida) / rendimientoProductoEspecial[0].rendimiento;
                            // Procesar la materia prima del producto especial
                            await this.procesarMateriaPrima(
                                prisma,
                                recetaEspecial.id_materia_prima,
                                cantidadProporcional,
                                `${producto.nombre} (via ${productoEspecial.nombre})`,
                                productosConsumidos,
                                ventasData,
                                fechaMovimiento
                            );
                        }
                    }
                }
            }
        }
    }

    async procesarMateriaPrima(prisma, idMateriaPrima, cantidad, nombreProducto, productosConsumidos, ventasData, fechaMovimiento) {
        const materiaPrima = await prisma.materia_prima.findUnique({
            where: { id_materia_prima: idMateriaPrima }
        });

        if (!materiaPrima) {
            throw new AppError('NotFound', 404, `Materia prima ${idMateriaPrima} no encontrada`, true);
        }

        // Calcular nuevo stock permitiendo valores negativos
        const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - Number(cantidad);
        
        // Actualizar stock de materia prima
        await prisma.materia_prima.update({
            where: { id_materia_prima: idMateriaPrima },
            data: { stock_actual: nuevoStockMateriaPrima }
        });

        // Agregar el producto al arreglo de productos consumidos
        productosConsumidos.push({
            producto: nombreProducto,
            cantidad: cantidad
        });

        // Verificar si ya hay un registro en kardex_materia_prima para la misma fecha y materia prima
        const kardexMateriaPrima = await prisma.kardex_materia_prima.findFirst({
            where: {
                id_materia_prima: idMateriaPrima,
                fecha_movimiento: fechaMovimiento,
            }
        });

        if (kardexMateriaPrima) {
            // Si existe, actualizar el registro existente sumando la cantidad
            await prisma.kardex_materia_prima.update({
                where: { id_kardex: kardexMateriaPrima.id_kardex },
                data: {
                    cantidad: {
                        increment: cantidad
                    },
                    saldo: nuevoStockMateriaPrima,
                    costo_total: {
                        increment: Number(materiaPrima.costo_unitario) * Number(cantidad)
                    },
                    observaciones: JSON.stringify(productosConsumidos)
                }
            });
        } else {
            // Si no existe, crear un nuevo registro
            await prisma.kardex_materia_prima.create({
                data: {
                    id_materia_prima: idMateriaPrima,
                    tipo_movimiento: "SALIDA",
                    cantidad: cantidad,
                    saldo: nuevoStockMateriaPrima,
                    costo_unitario: materiaPrima.costo_unitario,
                    costo_total: Number(materiaPrima.costo_unitario) * Number(cantidad),
                    referencia: ventasData.reference,
                    observaciones: JSON.stringify(productosConsumidos),
                    fecha_movimiento: fechaMovimiento
                }
            });
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
                        materia_prima: true,
                        productos_especiales: {
                            include: {
                                recetas: {
                                    include: {
                                        materia_prima: true
                                    }
                                }
                            }
                        }
                    }
                });

                // Procesar cada materia prima de la receta
                for (const receta of recetas) {
                    const cantidadRequerida = this.calcularCantidadEnGramos(
                        Number(receta.cantidad_requerida),
                        receta.unidad_medida
                    ) * Number(product.cantidad);

                    if (receta.id_materia_prima) {
                        const materiaPrima = await prisma.materia_prima.findUnique({
                            where: { id_materia_prima: receta.id_materia_prima }
                        });

                        if (!materiaPrima) {
                            resultados.push({
                                id_producto: product.id_producto,
                                success: false,
                                message: `Materia prima ${receta.id_materia_prima} no encontrada`
                            });
                            continue;
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
                                referencia: ventasData.reference,
                                observaciones: `Descuento de stock por venta. Cantidad: ${cantidadRequerida} gramos`,
                                fecha_movimiento: ventasData.fecha_movimiento
                            }
                        });
                    } else if (receta.productos_especiales) {
                        // Procesar producto especial
                        const productoEspecial = receta.productos_especiales;
                        
                        // Calcular la proporción basada en el rendimiento
                        // console.log(cantidadRequerida,cantidad);
                        const proporcion = cantidadRequerida / cantidad;

                        // Procesar las materias primas del producto especial
                        for (const recetaEspecial of productoEspecial.recetas) {
                            if (recetaEspecial.id_materia_prima) {
                                const cantidadProporcional = this.calcularCantidadEnGramos(
                                    Number(recetaEspecial.cantidad_requerida),
                                    recetaEspecial.unidad_medida
                                ) * proporcion;

                                const materiaPrima = await prisma.materia_prima.findUnique({
                                    where: { id_materia_prima: recetaEspecial.id_materia_prima }
                                });

                                if (!materiaPrima) {
                                    resultados.push({
                                        id_producto: product.id_producto,
                                        success: false,
                                        message: `Materia prima ${recetaEspecial.id_materia_prima} no encontrada en producto especial`
                                    });
                                    continue;
                                }

                                const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - cantidadProporcional;

                                // Actualizar stock de materia prima del producto especial
                                await prisma.materia_prima.update({
                                    where: { id_materia_prima: recetaEspecial.id_materia_prima },
                                    data: { stock_actual: nuevoStockMateriaPrima }
                                });

                                // Registrar movimiento en kardex_materia_prima para el producto especial
                                await prisma.kardex_materia_prima.create({
                                    data: {
                                        id_materia_prima: recetaEspecial.id_materia_prima,
                                        tipo_movimiento: "SALIDA",
                                        cantidad: cantidadProporcional,
                                        saldo: nuevoStockMateriaPrima,
                                        costo_unitario: materiaPrima.costo_unitario,
                                        costo_total: Number(cantidadProporcional) * Number(materiaPrima.costo_unitario),
                                        referencia: ventasData.reference,
                                        observaciones: `Descuento de stock por venta (producto especial). Cantidad: ${cantidadProporcional} gramos`,
                                        fecha_movimiento: ventasData.fecha_movimiento
                                    }
                                });
                            }
                        }
                    }
                }

                // Registrar movimiento en kardex_productos
                if (isUpdate) {
                    await prisma.kardex_productos.update({
                        where: { id_kardex: idKardex },
                        data: {
                            cantidad: Number(product.cantidad),
                            saldo: nuevoSaldo,
                            observaciones: `Actualizado por diferencia en cantidad: ${product.cantidad}`,
                            fecha_movimiento: ventasData.fecha_movimiento
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
                            fecha_movimiento: ventasData.fecha_movimiento
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

            return resultados;
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
                            materia_prima: true,
                            productos_especiales: {
                                include: {
                                    recetas: {
                                        include: {
                                            materia_prima: true
                                        }
                                    }
                                }
                            }
                        }
                    });

                    // Procesar cada materia prima de la receta
                    for (const receta of recetas) {
                        const cantidadRequerida = this.calcularCantidadEnGramos(
                            Number(receta.cantidad_requerida),
                            receta.unidad_medida
                        ) * Number(kardexProducto.cantidad);
                        if (receta.id_materia_prima) {
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
                        } else if (receta.productos_especiales) {
                            // Procesar producto especial
                            const productoEspecial = receta.productos_especiales;
                            
                            // Calcular la proporción basada en el rendimiento
                            const proporcion = cantidadRequerida / Number(productoEspecial.rendimiento);

                            // Procesar las materias primas del producto especial
                            for (const recetaEspecial of productoEspecial.recetas) {
                                if (recetaEspecial.id_materia_prima) {
                                    const cantidadProporcional = this.calcularCantidadEnGramos(
                                        Number(recetaEspecial.cantidad_requerida),
                                        recetaEspecial.unidad_medida
                                    ) * proporcion;

                                    const materiaPrima = await prisma.materia_prima.findUnique({
                                        where: { id_materia_prima: recetaEspecial.id_materia_prima }
                                    });

                                    if (!materiaPrima) {
                                        throw new AppError('NotFound', 404, `Materia prima ${recetaEspecial.id_materia_prima} no encontrada en producto especial`, true);
                                    }

                                    const nuevoStockMateriaPrima = Number(materiaPrima.stock_actual) - cantidadProporcional;

                                    // Actualizar stock de materia prima del producto especial
                                    await prisma.materia_prima.update({
                                        where: { id_materia_prima: recetaEspecial.id_materia_prima },
                                        data: { stock_actual: nuevoStockMateriaPrima }
                                    });

                                    // Registrar movimiento en kardex_materia_prima para el producto especial
                                    await prisma.kardex_materia_prima.create({
                                        data: {
                                            id_materia_prima: recetaEspecial.id_materia_prima,
                                            tipo_movimiento: "SALIDA",
                                            cantidad: cantidadProporcional,
                                            saldo: nuevoStockMateriaPrima,
                                            costo_unitario: materiaPrima.costo_unitario,
                                            costo_total: Number(cantidadProporcional) * Number(materiaPrima.costo_unitario),
                                            referencia: `Producción: ${producto.nombre}`,
                                            observaciones: `Descuento de stock por producción (producto especial). Cantidad: ${cantidadProporcional} gramos`
                                        }
                                    });
                                }
                            }
                        }
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
            // Generar la fecha base a partir de la referencia del archivo
            const decodedReference = atob(referencia);
            const dateStr = decodedReference.split('.')[1];
            const fecha = new Date(
                parseInt(dateStr.substring(0, 4)),
                parseInt(dateStr.substring(4, 6)) - 1,
                parseInt(dateStr.substring(6, 8))
            );
            
            // Generar referencia diaria en base64
            const fechaBase = fecha.toISOString().split('T')[0];
            const referenciaDiaria = btoa(fechaBase);
    
            // Buscar el kardex por la referencia diaria
            const kardex = await this.database.kardex_productos.findFirst({
                where: {
                    referencia: referenciaDiaria
                },
                include: {
                    productos_terminados: true
                }
            });
    
            if (!kardex) {
                return null;
            }
    
            // Verificar si el archivo específico ya fue procesado
            const isCreditoFile = /^credito2/.test(decodedReference);
            const fileReference = `${referencia}_${isCreditoFile ? 'credito' : 'piso'}`;
            
            const hasBeenProcessed = kardex.referencias_archivos.includes(fileReference);
    
            return {
                exists: true,
                hasFileBeenProcessed: hasBeenProcessed,
                kardex: kardex
            };
    
        } catch (error) {
            console.error('Error en obtenerKardexPorReferencia:', error);
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