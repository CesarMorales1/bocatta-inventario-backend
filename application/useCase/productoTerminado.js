import { CommonCrudMixin } from "./genericUseCase.js";
import { ProductoTerminado } from "../../domain/entities/ProductoTerminado.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";
import { ProductoEspecial } from "../../domain/entities/productoEspecial.js";

export class ProductoTerminadoUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'productos_terminados' });
    }

    async createOne(entityToSave) {
        try {
            // Validar la estructura básica de los datos
            if (!entityToSave || typeof entityToSave !== 'object') {
                throw new AppError(
                    'BadRequest',
                    400,
                    'Se requieren datos válidos para crear el producto',
                    true
                );
            }

            const { materias_primas, ...productoData } = entityToSave;
            
            // Validar materias primas
            if (!materias_primas || !Array.isArray(materias_primas) || materias_primas.length === 0) {
                throw new AppError(
                    'BadRequest',
                    400,
                    'Se requiere al menos una materia prima',
                    true
                );
            }

            // Crear instancia de ProductoTerminado para validación
            const productoToSave = new ProductoTerminado(productoData);
            
            return await this.database.$transaction(async (prisma) => {
                // 1. Crear el producto base
                const producto = await prisma.productos_terminados.create({
                    data: {
                        nombre: productoToSave.nombre,
                        precio_venta: productoToSave.precio_venta,
                        precio_produccion: productoToSave.precio_produccion,
                        id_moneda: productoToSave.id_moneda,
                        codigo_barras: productoToSave.codigo_barras,
                        stock_actual: productoToSave.stock_actual || 0
                    }
                });
                let productoEspecial;
                // 2. Si es un producto especial, crear el registro correspondiente
                if (entityToSave.isEspecial) {
                     productoEspecial = await prisma.productos_especiales.create({
                        data: {
                            id_producto: producto.id_producto,
                            rendimiento: entityToSave.rendimiento || 0,
                            unidad_rendimiento: 6 // Unidad de medida fija
                        }
                    });

                    // Actualizar el producto con la referencia al producto especial
                    await prisma.productos_terminados.update({
                        where: { id_producto: producto.id_producto },
                        data: { id_producto_especial: productoEspecial.id_producto_especial }
                    });
                }

                // 3. Crear las recetas para cada materia prima
                for (const ingrediente of materias_primas) {
                    // Validar que cada ingrediente tenga los campos necesarios
                    if (!ingrediente.cantidad_requerida || !ingrediente.unidad_medida) {
                        throw new AppError(
                            'BadRequest',
                            400,
                            'Cada ingrediente debe tener cantidad_requerida y unidad_medida',
                            true
                        );
                    }

                    // Validar que tenga al menos un tipo de referencia
                    if (!ingrediente.id_materia_prima && !ingrediente.id_producto_especial) {
                        throw new AppError(
                            'BadRequest',
                            400,
                            'Cada ingrediente debe tener id_materia_prima o id_producto_especial',
                            true
                        );
                    }
// console.log(ingrediente)
for (const ingrediente of materias_primas) {
    await prisma.recetas.create({
      data: {
        id_producto: producto.id_producto,
        id_materia_prima: ingrediente.id_materia_prima || null,
        id_producto_especial: ingrediente.id_producto_especial || null,
        cantidad_requerida: Number(ingrediente.cantidad_requerida),
        unidad_medida: Number(ingrediente.unidad_medida),
        disponible: true
      }
    });
  }
                }

                // 4. Retornar el producto completo con todas sus relaciones
                return await prisma.productos_terminados.findUnique({
                    where: { id_producto: producto.id_producto },
                    include: {
                        monedas: true,
                        recetas: {
                            include: {
                                materia_prima: true,
                                unidadesmedida: true,
                                productos_especiales: {
                                    include: {
                                        producto_terminado: true
                                    }
                                }
                            }
                        },
                        producto_especial: true
                    }
                });
            });

        } catch (error) {
            console.error('Error in createOne:', error);
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof PrismaClientValidationError) {
                throw new AppError('BadRequest', 400, `Error de validación: ${error.message}`, true);
            }
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw new AppError(
                'InternalServerError',
                500,
                'Error interno al crear el producto',
                true,
                error
            );
        }
    }

    updateIngredients = (oldIngredients, newIngredients) => {
        const ingredientMap = new Map();
        
        for (const newIngredient of newIngredients) {
            const key = newIngredient.id_materia_prima ? 
                       `m-${newIngredient.id_materia_prima}-${newIngredient.unidad_medida}` :
                       `e-${newIngredient.id_producto_especial}-${newIngredient.unidad_medida}`;
                       
            if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                existing.cantidad_requerida = Number(existing.cantidad_requerida) + Number(newIngredient.cantidad_requerida);
            } else {
                ingredientMap.set(key, {
                    id_materia_prima: newIngredient.id_materia_prima || null,
                    id_producto_especial: newIngredient.id_producto_especial || null,
                    cantidad_requerida: Number(newIngredient.cantidad_requerida),
                    unidad_medida: newIngredient.unidad_medida,
                    disponible: true
                });
            }
        }

        for (const oldIngredient of oldIngredients) {
            const key = oldIngredient.id_materia_prima ? 
                       `m-${oldIngredient.id_materia_prima}-${oldIngredient.unidad_medida}` :
                       `e-${oldIngredient.id_producto_especial}-${oldIngredient.unidad_medida}`;
                       
            if (!ingredientMap.has(key)) {
                ingredientMap.set(key, {
                    id_materia_prima: oldIngredient.id_materia_prima || null,
                    id_producto_especial: oldIngredient.id_producto_especial || null,
                    cantidad_requerida: Number(oldIngredient.cantidad_requerida),
                    unidad_medida: oldIngredient.unidad_medida,
                    disponible: false
                });
            }
        }

        return Array.from(ingredientMap.values());
    }

    async getAll() {
        try {
            return await this.database[`${this.tableName}`].findMany({
                include: {
                    monedas: true,
                    recetas: {
                        include: {
                            materia_prima: true,
                            unidadesmedida: true,
                            productos_especiales: {
                                include: {
                                    producto_terminado: true
                                }
                            }
                        }
                    },
                    producto_especial: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async getOne(referenceId) {
        try {
            const producto = await this.database[`${this.tableName}`].findUnique({
                where: { id_producto: referenceId },
                include: {
                    monedas: true,
                    recetas: {
                        include: {
                            materia_prima: true,
                            unidadesmedida: true,
                            productos_especiales: {
                                include: {
                                    producto_terminado: true
                                }
                            }
                        }
                    },
                    producto_especial: true
                }
            });
            
            if (producto) {
                return {
                    producto,
                    isEspecial: !!producto.producto_especial,
                    id_producto_especial: producto?.producto_especial?.id_producto_especial ?? undefined
                };
            }
            return null;
        } catch (error) {
            console.error('Error in getOne:', error);
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async updateOne(referenceId, updatedData) {
        try {
            const producto = await this.getOne(referenceId);
            if (!producto) {
                throw new AppError(
                    'NotFound',
                    404,
                    `El producto con ID ${referenceId} no existe.`,
                    true
                );
            }
    
            const { materias_primas, ...productoData } = updatedData;
            const validatedProduct = new ProductoTerminado(productoData);
            return await this.database.$transaction(async (prisma) => {
                await prisma.productos_terminados.update({
                    where: { id_producto: referenceId },
                    data: validatedProduct
                });
                await this._handleSpecialProduct(
                    prisma, 
                    referenceId, 
                    productoData.isEspecial, 
                    productoData.rendimiento, 
                    productoData.unidad_rendimiento
                );
                
                if (materias_primas && materias_primas.length > 0) {
                    await this._updateRecipes(prisma, referenceId, materias_primas);
                }
    
                return this._getUpdatedProduct(prisma, referenceId);
            });
    
        } catch (error) {
            console.error('Error in updateOne:', error);
            if (error instanceof AppError) throw error;
            if (error instanceof PrismaClientKnownRequestError) throw handlePrismaError(error);
            throw new AppError(
                'InternalError',
                500,
                'Error actualizando el producto',
                true
            );
        }
    }
    
    async _handleSpecialProduct(prisma, productId, isSpecial, rendimiento, medidaId) {
        try {
            if (isSpecial) {
                const productoValidado = new ProductoEspecial({
                    id_producto: productId, 
                    rendimiento: rendimiento, 
                    unidad_rendimiento: 6
                });

                let productoEspecial = await prisma.productos_especiales.findFirst({
                    where: { id_producto: productId }
                });

                if (!productoEspecial) {
                    productoEspecial = await prisma.productos_especiales.create({
                        data: productoValidado
                    });
                } else {
                    await prisma.productos_especiales.update({
                        where: { id_producto_especial: productoEspecial.id_producto_especial },
                        data: productoValidado
                    });
                }

                await prisma.productos_terminados.update({
                    where: { id_producto: productId },
                    data: { id_producto_especial: productoEspecial.id_producto_especial }
                });
            } else {
                await prisma.productos_especiales.deleteMany({
                    where: { id_producto: productId }
                });

                await prisma.productos_terminados.update({
                    where: { id_producto: productId },
                    data: { id_producto_especial: null }
                });
            }
        } catch (error) {
            console.error('Error in _handleSpecialProduct:', error);
            throw error;
        }
    }
    
    async _updateRecipes(prisma, productId, materiasPrimas) {
        try {
            await prisma.recetas.deleteMany({
                where: { id_producto: productId }
            });

            const recipesData = await Promise.all(materiasPrimas.map(async (ingrediente) => {
                if (ingrediente.id_producto_especial) {
                    const especialExists = await prisma.productos_especiales.findUnique({
                        where: { id_producto_especial: ingrediente.id_producto_especial }
                    });
                    
                    if (!especialExists) {
                        throw new AppError(
                            'NotFound',
                            404,
                            `El producto especial con ID ${ingrediente.id_producto_especial} no existe.`,
                            true
                        );
                    }
                } else if (ingrediente.id_materia_prima) {
                    const materiaPrimaExists = await prisma.materia_prima.findUnique({
                        where: { id_materia_prima: ingrediente.id_materia_prima }
                    });
                    
                    if (!materiaPrimaExists) {
                        throw new AppError(
                            'NotFound',
                            404,
                            `La materia prima con ID ${ingrediente.id_materia_prima} no existe.`,
                            true
                        );
                    }
                }

                return {
                    id_producto: productId,
                    id_materia_prima: ingrediente.id_materia_prima || null,
                    id_producto_especial: ingrediente.id_producto_especial || null,
                    cantidad_requerida: ingrediente.cantidad_requerida,
                    unidad_medida: ingrediente.unidad_medida,
                    disponible: true
                };
            }));

            await prisma.recetas.createMany({
                data: recipesData
            });
        } catch (error) {
            console.error('Error in _updateRecipes:', error);
            throw error;
        }
    }
    
    async _getUpdatedProduct(prisma, productId) {
        return prisma.productos_terminados.findUnique({
            where: { id_producto: productId },
            include: {
                monedas: true,
                recetas: {
                    include: {
                        materia_prima: true,
                        unidadesmedida: true,
                        productos_especiales: {
                            include: {
                                producto_terminado: true
                            }
                        }
                    }
                },
                producto_especial: true
            }
        });
    }

    async deleteOne(referenceId) {
        try {
            return await this.database.$transaction(async (prisma) => {
                await prisma.recetas.updateMany({
                    where: { id_producto: referenceId },
                    data: { disponible: false }
                });

                return await prisma.productos_terminados.delete({
                    where: { id_producto: referenceId }
                });
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }
}