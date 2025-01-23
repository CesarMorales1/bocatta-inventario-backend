import { CommonCrudMixin } from "./genericUseCase.js";
import {UnidadMedida} from "../../domain/entities/unidadMedida.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class UnidadMedidaUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'unidadesmedida' });
    }

    async createOne(entityToSave) {
        try {
            const unidadMedidaToSave = new UnidadMedida(entityToSave);
            return await this.database[`${this.tableName}`].create({
                data: unidadMedidaToSave
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

    async getAll() {
        try {
            return await this.database[`${this.tableName}`].findMany({
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
                where: { id: referenceId },
                include: {
                    detalle_factura: true,
                    recetas: true,
                    materia_prima: true
                }
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw error;
        }
    }
}