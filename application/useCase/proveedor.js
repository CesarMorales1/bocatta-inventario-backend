import { CommonCrudMixin } from "./genericUseCase.js";
import {Proveedor}         from "../../domain/entities/Proveedor.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError } from "../../domain/exeptions/PrismaMapError.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class ProveedorUseCase extends CommonCrudMixin
{
    constructor({database})
    {
        super({database: database,tableName: 'proveedores'})
    }

    async createOne(entityToSave)
    {
        try {
            const proveedorToSave = new Proveedor(entityToSave);
            return super.createOne(proveedorToSave);
        } catch (error) {
            throw error;
        }
    }

    async deleteOne(referenceId)
    {
        try {
            const deletedProveedor = super.deleteOne(referenceId);
            return deletedProveedor;
        } catch (error) {
            throw error;
        }
    }

    async getAll()
    {
        try {
            const proveedores = await super.getAll();
            return proveedores;
        } catch (error) {
            throw error;
        }
    }

    async getOne(referenceId)
    {
        try {
            const proveedor = await this.database[`${this.tableName}`].findUnique(
                {
                    where:{id_proveedor: referenceId}
                })
            return proveedor;
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

    async updateOneProveedor(referenceId, updatedData) {
        try {
            // Comprobar si el proveedor existe
            const proveedor = await this.getOne(referenceId);
            if (!proveedor) {
                throw new AppError(
                    'NotFound',
                    404,
                    `El proveedor con ID ${referenceId} no existe.`,
                    true
                );
            }
            const proveedorNewInformation = new Proveedor(updatedData);
            // Actualizar el proveedor
            const updatedProveedor = await this.database[`${this.tableName}`].update({
                where: { id_proveedor: referenceId },
                data: proveedorNewInformation
            });
    
            return updatedProveedor;
        } catch (error) {
            if(error instanceof AppError)
                {
                    throw error
                }
            if (error instanceof PrismaClientValidationError) {
                throw new AppError(
                    'BadRequest',
                    400,
                    `Algún valor no cumple con las restricciones de la base de datos: ${error.message}`,
                    true
                );
            }
            if (error instanceof PrismaClientKnownRequestError) {
                throw handlePrismaError(error);
            }
            throw new AppError('Un error interno ocurrió', 500, 'Error interno del servidor', false);
        }
    }
    
}