import { CommonCrudMixin } from "./genericUseCase.js";
import { ProductoTerminado } from "../../domain/entities/ProductoTerminado.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class ProductoTerminadoUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'productos_terminados' });
    }

    async createOne(entityToSave) {
        try {
            const { materias_primas, ...productoData } = entityToSave;
            const productoToSave = new ProductoTerminado(productoData);
            // Crear el producto y sus recetas en una transacción
            const result = await this.database.$transaction(async (prisma) => {
                // Crear el producto
                const producto = await prisma.productos_terminados.create({
                    data: productoToSave,
                });

                // Si hay materias primas, crear las recetas
                if (materias_primas && materias_primas.length > 0) {
                    // Primero, agrupar las materias primas duplicadas
                    const materiasAgrupadas = materias_primas.reduce((acc, materia) => {
                        const key = `${materia.id_materia_prima}-${materia.unidad_medida}`;
                        if (!acc[key]) {
                            acc[key] = { ...materia };
                        } else {
                            acc[key].cantidad_requerida = Number(acc[key].cantidad_requerida) + Number(materia.cantidad_requerida);
                        }
                        return acc;
                    }, {});

                    const recetasPromises = Object.values(materiasAgrupadas).map(materia => 
                        prisma.recetas.create({
                            data: {
                                id_producto: producto.id_producto,
                                id_materia_prima: materia.id_materia_prima,
                                cantidad_requerida: materia.cantidad_requerida,
                                unidad_medida: materia.unidad_medida,
                                disponible: true
                            }
                        })
                    );

                    await Promise.all(recetasPromises);
                }

                // Retornar el producto con sus recetas
                return await prisma.productos_terminados.findUnique({
                    where: { id_producto: producto.id_producto },
                    include: {
                        monedas: true,
                        recetas: {
                            include: {
                                materia_prima: true,
                                unidadesmedida: true
                            }
                        }
                    }
                });
            });

            return result;
        } catch (error) {
            if (error instanceof PrismaClientValidationError) {
                throw new AppError('BadRequest', 400, `Error de validación: ${error.message}`, true);
            }
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    updateIngredients = (oldIngredients, newIngredients) => {
        // Usar un Map para agrupar ingredientes por id_materia_prima y unidad_medida
        const ingredientMap = new Map();

        // Procesar nuevos ingredientes
        for (const newIngredient of newIngredients) {
            const key = `${newIngredient.id_materia_prima}-${newIngredient.unidad_medida}`;
            if (ingredientMap.has(key)) {
                // Si ya existe, sumar la cantidad
                const existing = ingredientMap.get(key);
                existing.cantidad_requerida = Number(existing.cantidad_requerida) + Number(newIngredient.cantidad_requerida);
            } else {
                // Si no existe, agregar nuevo
                ingredientMap.set(key, {
                    id_materia_prima: newIngredient.id_materia_prima,
                    cantidad_requerida: Number(newIngredient.cantidad_requerida),
                    unidad_medida: newIngredient.unidad_medida,
                    disponible: true
                });
            }
        }

        // Procesar ingredientes antiguos que no están en los nuevos
        for (const oldIngredient of oldIngredients) {
            const key = `${oldIngredient.id_materia_prima}-${oldIngredient.unidad_medida}`;
            if (!ingredientMap.has(key)) {
                ingredientMap.set(key, {
                    id_materia_prima: oldIngredient.id_materia_prima,
                    cantidad_requerida: Number(oldIngredient.cantidad_requerida),
                    unidad_medida: oldIngredient.unidad_medida,
                    disponible: false
                });
            }
        }

        // Convertir el Map a array
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
                            unidadesmedida: true
                        }
                    }
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
            return await this.database[`${this.tableName}`].findUnique({
                where: { id_producto: referenceId },
                include: {
                    monedas: true,
                    recetas: {
                        include: {
                            materia_prima: true,
                            unidadesmedida: true
                        }
                    }
                }
            });
        } catch (error) {
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

            // Actualizar el producto y sus recetas en una transacción
            const result = await this.database.$transaction(async (prisma) => {
                // Actualizar el producto
                await prisma.productos_terminados.update({
                    where: { id_producto: referenceId },
                    data: productoData
                });

                // Si hay materias primas, actualizar las recetas

                if (materias_primas && materias_primas.length > 0) {
                    // Eliminar todas las recetas existentes
                    await prisma.recetas.deleteMany({
                        where: { id_producto: referenceId }
                    });

                    // Agregar nuevos ingredientes
                    const recetasPromises = materias_primas.map(ingrediente => 
                        prisma.recetas.create({
                            data: {
                                id_producto: referenceId,
                                id_materia_prima: ingrediente.id_materia_prima,
                                cantidad_requerida: ingrediente.cantidad_requerida,
                                unidad_medida: ingrediente.unidad_medida,
                                disponible: ingrediente.disponible
                            }
                        })
                    );
                    await Promise.all(recetasPromises);
                }

                // Retornar el producto actualizado con sus recetas
                return await prisma.productos_terminados.findUnique({
                    where: { id_producto: referenceId },
                    include: {
                        monedas: true,
                        recetas: {
                            include: {
                                materia_prima: true,
                                unidadesmedida: true
                            }
                        }
                    }
                });
            });

            return result;
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

    async deleteOne(referenceId) {
        try {
            return await this.database.$transaction(async (prisma) => {
                // Desactivar las recetas asociadas
                await prisma.recetas.updateMany({
                    where: { id_producto: referenceId },
                    data: { disponible: false }
                });

                // Eliminar el producto
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