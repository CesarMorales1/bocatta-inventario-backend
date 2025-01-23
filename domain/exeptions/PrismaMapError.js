import {AppError} from "./AppError.js"

const prismaErrorMap = {
    P2000: {
        message: "El valor proporcionado es demasiado largo para el tipo de columna.",
        httpCode: 400,
        errorType: "ValidationError",
    },
    P2001: {
        message: "El registro buscado no existe.",
        httpCode: 404,
        errorType: "NotFoundError",
    },
    P2002: {
        message: "Violación de una restricción única.",
        httpCode: 409,
        errorType: "ConflictError",
    },
    P2003: {
        message: "Violación de una restricción de clave foránea.",
        httpCode: 409,
        errorType: "ForeignKeyError",
    },
    P2004: {
        message: "Falló una restricción en la base de datos.",
        httpCode: 400,
        errorType: "DatabaseConstraintError",
    },
    P2005: {
        message: "El valor almacenado en la base de datos no es válido para el campo.",
        httpCode: 400,
        errorType: "InvalidDatabaseValueError",
    },
    P2006: {
        message: "El valor proporcionado no es válido para el campo.",
        httpCode: 400,
        errorType: "InvalidInputError",
    },
    P2007: {
        message: "Error de validación de datos.",
        httpCode: 400,
        errorType: "DataValidationError",
    },
    P2008: {
        message: "Falló al analizar la consulta.",
        httpCode: 400,
        errorType: "QueryParsingError",
    },
    P2009: {
        message: "Error al validar la consulta.",
        httpCode: 400,
        errorType: "QueryValidationError",
    },
};

export const handlePrismaError = (prismaError) => {
    const mappedError = prismaErrorMap[prismaError.code];

    if (mappedError) {
        return new AppError(
            mappedError.errorType,
            mappedError.httpCode,
            mappedError.message,
            true
        );
    }
    // Si no hay un mapeo específico, devolver un error genérico
    return new AppError(
        "DatabaseError",
        500,
        "Ha ocurrido un error con la base de datos.",
        false
    );
};
