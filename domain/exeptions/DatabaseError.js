import { AppError } from "./Error.js";
export class DataBaseError extends AppError
{
    constructor(description,httpCode = 400,isOperational = true)
    {
        super('DataBaseError',httpCode,description,isOperational);
    }

    static formatoInvalido(description = 'Formato invalido para la base de datos')
    {
        return new DataBaseError(description,400)
    }

    static connectionFailed(description = 'No se pudo conectar con la base de datos')
    {
        return new DataBaseError(description,500,false);
    }
}