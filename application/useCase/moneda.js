import { CommonCrudMixin } from "./genericUseCase.js";
import { Moneda } from "../../domain/entities/Moneda.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class MonedaUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'monedas' });
    }

    async createOne(entityToSave) {
        try {
            const monedaToSave = new Moneda(entityToSave);
            return await this.database[`${this.tableName}`].create({
                data: monedaToSave
            });
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

    async updateOne(referenceId, updatedData) {
        try {
            const moneda = await this.getOne(referenceId);
            if (!moneda) {
                throw new AppError(
                    'NotFound',
                    404,
                    `La moneda con ID ${referenceId} no existe.`,
                    true
                );
            }

            // Solo permitir actualizar la tasa de cambio
            if (!updatedData.tasa_cambio) {
                throw new AppError(
                    'BadRequest',
                    400,
                    'Solo se permite actualizar la tasa de cambio.',
                    true
                );
            }

            if (updatedData.tasa_cambio <= 0) {
                throw new AppError(
                    'BadRequest',
                    400,
                    'La tasa de cambio debe ser mayor que 0.',
                    true
                );
            }

            return await this.database[`${this.tableName}`].update({
                where: { id_moneda: referenceId },
                data: { tasa_cambio: updatedData.tasa_cambio },
                include: {
                    facturas: true,
                    productos_terminados: true
                }
            });
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

    async getAll() {
        try {
            return await this.database[`${this.tableName}`].findMany({
                include: {
                    facturas: true,
                    productos_terminados: true
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
            const moneda = await this.database[`${this.tableName}`].findUnique({
                where: { id_moneda: referenceId },
                include: {
                    facturas: true,
                    productos_terminados: true
                }
            });
            return moneda;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }

    async deleteOne(referenceId) {
        try {
            return await this.database[`${this.tableName}`].delete({
                where: { id_moneda: referenceId }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }
}