import { AppError } from "../../domain/exeptions/AppError.js";
import { Validator } from "../../utils/validator.js";

// Plantilla de validaciones para creación de materiaPrima
const materiaPrimaCreationInputs = {
    nombre: 'isTextWithoutNumbers',
    // unidad_medida_id: 'isOnlyNumbers',
    costo_unitario: 'isOnlyNumbersWithDecimals',
    stock_actual: 'isOnlyNumbersWithDecimals',
    // codigo_barras: 'isOnlyNumbers'
};

export function createMateriaPrimaValidation(req, res, next) {
    const incomingMateriaPrima = req.body;

    for (const [inputName, validatorFunction] of Object.entries(materiaPrimaCreationInputs)) {
        if (!(inputName in incomingMateriaPrima)) {
            const response = new AppError('BadRequest', 400, `El campo ${inputName} es necesario`, true);
            console.log(response.message);
            res.status(response.httpCode).json({
                nombre: response.nombre,
                status: response.httpCode,
                descripcion: response.message,
                isOperational: response.isOperational
            });
            console.log(response);
            return;
        }

        const value = incomingMateriaPrima[inputName];

        if (validatorFunction in Validator) {
            const isValid = Validator[validatorFunction](value);
            if (!isValid) {
                const response = new AppError('BadRequest', 400, `El campo ${inputName} no cumple con el formato requerido. Debe ser ${validatorFunction}`, true);
                res.status(response.httpCode).json({
                    nombre: response.nombre,
                    status: response.httpCode,
                    descripcion: response.message,
                    isOperational: response.isOperational
                });
                console.log(response);
                return;
            }
        }
    }
    next();
}


const materiaPrimaSingleInput = {
    nombre: 'isTextWithoutNumbers',
    unidad_medida_id: 'isOnlyNumbers',
    costo_unitario: 'isOnlyNumbersWithDecimals',
    stock_actual: 'isOnlyNumbersWithDecimals',
    codigo_barras: 'isOnlyNumbers',
};

export function singleMateriaPrimaValidation(req, res, next) {
    const keys = Object.keys(req.body);
    
    // Verificar si hay exactamente una clave en req.body
    if (keys.length !== 1) {
        return res.status(400).json({ error: 'Se requiere un solo elemento en el cuerpo de la solicitud.' });
    }
    
    const key = keys[0];
    const value = req.body[key];
    const expectedType = materiaPrimaSingleInput[key];

    if (!expectedType) {
        return res.status(400).json({ error: 'El campo proporcionado no es válido.' });
    }

    if (!(expectedType in Validator)) {
        return res.status(500).json({ error: 'Error interno del servidor: validador no encontrado.' });
    }

    const isValid = Validator[expectedType](value);

    if (!isValid) {
        return res.status(400).json({ error: `El valor de ${key} no es válido: debe ser ${expectedType}.` });
    }

    next();
}

export {
    materiaPrimaSingleInput
}

// Plantilla de validaciones para actualización de materiaPrima
const materiaPrimaUpdateInputs = {
    ...materiaPrimaCreationInputs,
    disponible: 'isBoolean'
};

export function updateMateriaPrimaValidation(req, res, next) {
    const incomingFields = req.body;

    // Verificar si el cuerpo de la solicitud está vacío
    if (Object.keys(incomingFields).length === 0) {
        return res.status(400).json({
            error: 'El cuerpo de la solicitud no puede estar vacío. Proporcione al menos un campo para actualizar.'
        });
    }

    for (const [inputName, value] of Object.entries(incomingFields)) {
        // Verificar si el campo es válido
        if (!(inputName in materiaPrimaUpdateInputs)) {
            return res.status(400).json({
                error: `El campo "${inputName}" no es válido.`
            });
        }

        // Validar el campo usando el validador correspondiente
        const validatorFunction = materiaPrimaUpdateInputs[inputName];

        if (validatorFunction in Validator) {
            const isValid = Validator[validatorFunction](value);
            if (!isValid) {
                return res.status(400).json({
                    error: `El campo "${inputName}" no cumple con el formato requerido. Debe ser ${validatorFunction}.`
                });
            }
        } else {
            return res.status(500).json({
                error: `Error interno del servidor: el validador para "${inputName}" no está definido.`
            });
        }
    }

    next();
}
