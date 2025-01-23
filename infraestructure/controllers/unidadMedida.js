import { UnidadMedidaUseCase } from "../../application/useCase/unidadMedida.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { UnidadMedida } from "../../domain/entities/unidadMedida.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class UnidadMedidaController {
    constructor(database) {
        this.unidadMedidaUseCase = new UnidadMedidaUseCase({ database });
    }

    createOneUnidadMedida = async (req, res, next) => {
        try {
            const incomingUnidadMedida = req.body;
            const newUnidadMedida = new UnidadMedida(incomingUnidadMedida);
            const result = await this.unidadMedidaUseCase.createOne(newUnidadMedida);
            const response = ResponseApi.successfulRequest(result, 'La unidad de medida ha sido creada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllUnidadesMedida = async (req, res, next) => {
        try {
            const unidadesMedida = await this.unidadMedidaUseCase.getAll();
            const response = ResponseApi.successfulRequest(unidadesMedida, 'Unidades de medida obtenidas con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getOneUnidadMedida = async (req, res, next) => {
        try {
            const { id } = req.params;
            const unidadMedida = await this.unidadMedidaUseCase.getOne(Number(id));
            
            if (!unidadMedida) {
                const response = ResponseApi.notFound('La unidad de medida no ha sido encontrada', null);
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest(unidadMedida, 'Unidad de medida encontrada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}