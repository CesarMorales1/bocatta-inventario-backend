import { PrismaClient }                  from "@prisma/client";
import {CommonCrudInterface}             from "../../domain/repositories/commonCrud.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { handlePrismaError }             from "../../domain/exeptions/PrismaMapError.js";
import {AppError}                        from "../../domain/exeptions/AppError.js"

export class CommonCrudMixin extends CommonCrudInterface
{
    constructor({database,tableName})
    {
        super();
        this.database  = database;
        this.tableName = tableName;
    }

    async createOne(entityToSave)
    {
        try {
            const result = await this.database[`${this.tableName}`].create({data: entityToSave});
            return result
        } catch (error) {
            console.log(error);
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

    async deleteOne(referenceId)
    {
        try {
            const result = await this.database[`${this.tableName}`].delete({where: {id_proveedor: referenceId}});
            return result;
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

    async getAll()
    {
        try {
            const results = await this.database[`${this.tableName}`].findMany();
            return results;
        } catch (error) {
            console.log(error)
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
}