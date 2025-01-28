import { CommonCrudMixin } from "./genericUseCase.js";
import { Factura } from "../../domain/entities/Factura.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";
import {DetalleFactura} from "../../domain/entities/detalleFactura.js"
import {MateriaPrimaUseCase} from "./MateriaPrimaUseCase.js"
 
const ingredientsCache = new Map();
const pendingPromises = new Map();

async function validateFacturaIngredient(ingredient,database) {
    // Si ya está en caché, retornarlo inmediatamente
    if (ingredientsCache.has(ingredient)) {
        return ingredientsCache.get(ingredient);
    }

    // Si ya hay una promesa pendiente para este ingrediente, esperar por ella
    if (pendingPromises.has(ingredient)) {
        return pendingPromises.get(ingredient);
    }
    // Crear una nueva promesa para este ingrediente
    const promise = (async () => {
        try {
            const ingredienteUseCase = new MateriaPrimaUseCase({database});
            const ingrediente = await ingredienteUseCase.getOne(ingredient);

            if (!ingrediente) {
                throw new AppError('BadRequest', 400, `El ingrediente ${ingredient} no se encuentra en la base de datos.`);
            }

            // Almacenar en caché el resultado
            ingredientsCache.set(ingredient, ingrediente);
            return ingrediente;
        } finally {
            // Limpiar la promesa pendiente una vez completada
            pendingPromises.delete(ingredient);
        }
    })();

    // Almacenar la promesa pendiente
    pendingPromises.set(ingredient, promise);
    
    return promise;
}

export class FacturaUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'facturas' });
    }

    async createFacturaConDetalles(facturaData, detalles) {
        if (!facturaData || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
            throw new AppError(
                'BadRequest',
                400,
                'Se requieren datos de factura y al menos un detalle'
            );
        }
        try {
            // 1. Validar todos los ingredientes en paralelo antes de iniciar la transacción
            const validationPromises = detalles.map(detalle => 
                validateFacturaIngredient(detalle.barcode,this.database)
            );
        
            // Esperar a que todas las validaciones se completen
            await Promise.all(validationPromises);
        
            // Creando instancia de la clase factura
            const facturaDateValidated = new Factura({
                id_proveedor: facturaData.id_proveedor,
                id_moneda: 1,
                fecha_factura: facturaData.fecha_factura,
                estado: true,
                total: facturaData.total
            });
        
            // 2. Si todas las validaciones pasan, proceder con la transacción
            return await this.database.$transaction(async (prisma) => {
                // Crear la factura primero
                const factura = await prisma.facturas.create({
                    data: {
                        ...facturaDateValidated
                    },
                });
        
                const detallesCreados = []; // Inicializar detallesCreados
        
                // Crear los detalles secuencialmente para mantener el orden
                for (const detalle of detalles) {
                    let detalleCreado; // Asegurarse de que detalleCreado esté definido antes de usarlo
                    try {
                        detalleCreado = await prisma.detalle_factura.create({
                            data: {
                                id_factura: factura.id_factura,
                                id_materia_prima: detalle.id_materia_prima,
                                cantidad: detalle.cantidad,
                                precio_unitario: detalle.precio_unitario,
                                subtotal: detalle.subtotal,
                                unidad_medida: 6,
                            },
                        });
                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
        
                    // Actualizar el stock inmediatamente después de crear cada detalle
                    const updatedMateriaPrima = await prisma.materia_prima.update({
                        where: { 
                            id_materia_prima: detalle.id_materia_prima
                        },
                        data: {
                            stock_actual: {
                                increment: Number(detalle.cantidad) * Number(detalle.presentation)
                            },
                            costo_unitario: Number(detalle.precio_unitario)
                        }
                    });
        
                    // Realizar movimiento dentro de kardex materia prima usando el stock actual
                    // Si ya hay un registro de ese día, aumentar la cantidad comprada
                    const kardexMateriaPrima = await prisma.kardex_materia_prima.findFirst({
                        where: {
                            id_materia_prima: detalle.id_materia_prima,
                            fecha_movimiento: factura.fecha_factura,
                        }
                    });
                    if (kardexMateriaPrima) {
                        await prisma.kardex_materia_prima.update({
                            where: {
                                id_kardex: kardexMateriaPrima.id_kardex,
                            },
                            data: {
                                cantidad: {
                                    increment: Number(detalle.cantidad) * Number(detalle.presentation)
                                },
                                costo_total: {
                                    increment: Number(detalle.cantidad) * Number(detalle.presentation) * Number(detalle.precio_unitario)
                                }
                            }
                        });
                    } else {
                        await prisma.kardex_materia_prima.create({
                            data: {
                                id_materia_prima: detalle.id_materia_prima,
                                cantidad: Number(detalle.cantidad) * Number(detalle.presentation),
                                tipo_movimiento: 'ENTRADA',
                                referencia: factura.id_factura.toString(),
                                fecha_movimiento: factura.fecha_factura,
                                saldo: updatedMateriaPrima.stock_actual, // Usar el stock actualizado aquí
                                costo_unitario: updatedMateriaPrima.costo_unitario,
                                costo_total: updatedMateriaPrima.costo_unitario * detalle.cantidad,
                                observaciones: `Movimiento de entrada para la factura ${factura.id_factura} por la cantidad de ${Number(detalle.cantidad) * Number(detalle.presentation)}`,
                            }
                        });
                    }
        
                    detallesCreados.push(detalleCreado);
                }
        
                return {
                    ...factura,
                    detalles: detallesCreados
                };
            });
        
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw new AppError(
                'InternalServerError',
                500,
                'Error al crear la factura con detalles',
                true,
                error
            );
        }}        

    async deleteOne(referenceId) {
        try {
            // Implementamos borrado lógico cambiando el estado a false
            const updatedFactura = await this.database[`${this.tableName}`].update({
                where: { id_factura: referenceId },
                data: { estado: false }
            });
            return updatedFactura;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async getAll() {
        try {
            const facturas = await this.database[`${this.tableName}`].findMany({
                include: {
                    monedas: true,
                    proveedores: true,
                    detalle_factura: true
                },
                where: {
                    estado: true
                }
            });
            return facturas;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async getOne(referenceId) {
        try {
            const factura = await this.database[`${this.tableName}`].findUnique({
                where: { id_factura: referenceId },
                include: {
                    monedas: true,
                    proveedores: true,
                    detalle_factura: true
                }
            });
            return factura;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async updateOne(referenceId, updatedData) {
        try {
            const factura = await this.getOne(referenceId);
            if (!factura) {
                throw new AppError(
                    'NotFound',
                    404,
                    `La factura con ID ${referenceId} no existe.`,
                    true
                );
            }

            const updatedFactura = await this.database[`${this.tableName}`].update({
                where: { id_factura: referenceId },
                data: updatedData,
                include: {
                    monedas: true,
                    proveedores: true,
                    detalle_factura: true
                }
            });

            return updatedFactura;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }
}