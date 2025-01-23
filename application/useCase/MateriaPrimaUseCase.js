import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { MateriaPrima } from "../../domain/entities/MateriaPrima.js";
import { CommonCrudMixin } from "./genericUseCase.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class MateriaPrimaUseCase extends CommonCrudMixin
{
    constructor({database})
    {
        super({database: database,tableName: "materia_prima" })
    }

    async createOne(materiaPrimaToSave)
    {
    try {
        const materiaPrima = new MateriaPrima(materiaPrimaToSave);
        return super.createOne(materiaPrima);
    } catch (error) {
        throw error;
    }
        
    }

    getOne = async (referenceCodigoBarra) => 
        {
            try {
                const materiaPrima = this.database[`${this.tableName}`].findUnique(
                    {
                        where:{codigo_barras: referenceCodigoBarra}
                    })
                return materiaPrima;
            } catch (error) {
                if(error instanceof PrismaClientValidationError)
                    {
                        throw new AppError('BadRequest',400,`Alguna fila no existe o algun valor no cumple con los valores de la base de datos ${error.message}`,true);
                    }
                if(error instanceof PrismaClientKnownRequestError)
                    {
                        throw handlePrismaError(error);
                    }
                throw new AppError('Un error interno a ocurrido',500,'Un error interno de servidor',false);
            }
        }

        async editOne(referenceCodigoBarra, updatedData) {
            try {
                // Verificar que exista la materia prima
                const existingMateriaPrima = await this.getOne(referenceCodigoBarra);
                if (!existingMateriaPrima) {
                    throw new AppError("NotFound", 404, "La materia prima no fue encontrada", true);
                }

                // Actualizar la materia prima
                const updatedMateriaPrima = await this.database[`${this.tableName}`].update({
                    where: { codigo_barras: referenceCodigoBarra },
                    data: updatedData,
                });
    
                return updatedMateriaPrima;
            } catch (error) {
                if (error instanceof PrismaClientValidationError) {
                    throw new AppError(
                        "BadRequest",
                        400,
                        `Error de validación en la base de datos: ${error.message}`,
                        true
                    );
                }
                if (error instanceof PrismaClientKnownRequestError) {
                    throw handlePrismaError(error);
                }
                throw new AppError("Un error interno ocurrió", 500, "Error interno del servidor", false);
            }
        }

        async getAll()
        {
            try {
                const materiaPrimas = await super.getAll();
                return materiaPrimas;
            } catch (error) {
                throw error;
            }
        }

        async deleteOne(referenceId) {
            try {
                // Verifica si la materia prima existe
                const existingMateriaPrima = await this.getOne(referenceId);
                if (!existingMateriaPrima) {
                    throw new AppError(
                        'NotFound',
                        404,
                        `La materia prima con el ID ${referenceId} no fue encontrada.`,
                        true
                    );
                }
        
                // Realiza el borrado lógico estableciendo disponible en false
                const updatedMateriaPrima = await this.database[`${this.tableName}`].update({
                    where: { codigo_barras: referenceId },
                    data: { disponible: false },
                });
        
                return updatedMateriaPrima;
            } catch (error) {
                if (error instanceof PrismaClientValidationError) {
                    throw new AppError(
                        'BadRequest',
                        400,
                        `Alguna fila no existe o algún valor no cumple con los valores de la base de datos: ${error.message}`,
                        true
                    );
                }
                if (error instanceof PrismaClientKnownRequestError) {
                    throw handlePrismaError(error);
                }
                throw new AppError(
                    'InternalServerError',
                    500,
                    'Un error interno de servidor ocurrió',
                    false
                );
            }
        }
        
}