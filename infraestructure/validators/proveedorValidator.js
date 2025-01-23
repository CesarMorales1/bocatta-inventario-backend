import { AppError } from "../../domain/exeptions/AppError.js";
import {Validator} from "../../utils/validator.js"
//Creo una plantilla con los nombre que pide mi logica de negocio y dentro de la classe la validacion que necesito de validator
const proveedorInputs = 
{
    nombre:         'isTextWithoutNumbers',
    contacto:       'isAnEmail',
    telefono :      'isOnlyNumbers',
    direccion:      'date',
    empresa_nombre: 'string',
}

export function proveedorValidation(req,res,next)
{
    const incomingProveedor = req.body;
        for (const [inputName, validatorFunction] of Object.entries(proveedorInputs)) {
            if (!(inputName in incomingProveedor)) {
                const response = new AppError('BadRequest', 400, `El campo ${inputName} es necesario`, true);
                console.log(response.message);
                res.status(response.httpCode).json(
                    {
                        nombre: response.nombre,
                        status: response.httpCode,
                        descripcion: response.message,
                        isOperational: response.isOperational
                    })
                return
            }

            const value = incomingProveedor[inputName];

            if (validatorFunction in Validator) {
                const isValid = Validator[validatorFunction](value);
                if (!isValid) {
                    const response = new AppError('BadRequest', 400, `El campo ${inputName} no cumple con el formato requerido debe de ser ${validatorFunction}`, true);
                    res.status(response.httpCode).json(
                        {
                            nombre: response.nombre,
                            status: response.httpCode,
                            descripcion: response.message,
                            isOperational: response.isOperational
                        })
                    return
                }
            }
        }
        next();
}

const proveedorSingleInput = {
    id_proveedor: 'isOnlyNumbers',
    nombre: 'isTextWithoutNumbers',
    contacto: 'isAnEmail',
    telefono: 'isOnlyNumbers',
    direccion: 'date',
    empresa_nombre: 'string',
};

export function singleProveedorValidation(req, res, next) {
    const keys = Object.keys(req.body);
    
    // Verificar si hay exactamente una clave en req.body
    if (keys.length !== 1) {
        return res.status(400).json({ error: 'Se requiere un solo elemento en el cuerpo de la solicitud.' });
    }
    
    const key = keys[0];
    const value = req.body[key];
    const expectedType = proveedorSingleInput[key];

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

export
{
    proveedorSingleInput
}




