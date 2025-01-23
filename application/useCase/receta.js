import { CommonCrudMixin } from "./genericUseCase.js";
import { Receta } from "../../domain/entities/Receta.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class RecetaUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'recetas' });
    }
    async getOne(referenceId) {
        try {
            const receta = await this.database.recetas.findUnique({
                where: { id_receta: referenceId }
            });
            if (!receta) {
                throw new AppError(
                    'NotFound',
                    404,
                    `La receta con ID ${referenceId} no existe.`,
                    true);
            }
            return receta;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }
    async createFromProduct(productData) {
        try {
            const { ingredients } = productData;
            
            // Crear las recetas en una transacción
            const result = await this.database.$transaction(async (prisma) => {
                const recetasPromises = ingredients.map(ingredient => {
                    const recetaData = new Receta({
                        id_producto,
                        id_materia_prima: ingredient.material.id,
                        cantidad_requerida: ingredient.quantity,
                        unidad_medida: ingredient.material.unitId
                    });

                    return prisma.recetas.create({
                        data: {
                            id_producto: recetaData.id_producto,
                            id_materia_prima: recetaData.id_materia_prima,
                            cantidad_requerida: recetaData.cantidad_requerida,
                            unidad_medida: recetaData.unidad_medida,
                            disponible: recetaData.disponible
                        }
                    });
                });

                return await Promise.all(recetasPromises);
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

    getAll = async () => 
        {
            try {
                return await super.getAll();
            } catch (error) {
                throw error
            }
        }

    // updateOneReceta = async (referenceId, updatedData, productoTerminadoUseCase) => 
    //     {

    //         try {
    //             const 
    //             // const result = await this.database[`${this.tableName}`].update({
    //             //     where: { id_receta: referenceId },
    //             //     data: updatedData
    //             // });
    //             // return result

    //         } catch (error) {
    //         if (error instanceof PrismaClientValidationError) {
    //             throw new AppError('BadRequest', 400, `Error de validación: ${error.message}`, true);
    //         }
    //         if (error instanceof PrismaClientKnownRequestError) {
    //             throw handlePrismaError(error);
    //         }
    //         throw error;
    //         }
    //     }
}
