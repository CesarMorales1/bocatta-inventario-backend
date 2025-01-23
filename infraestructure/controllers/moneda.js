import { MonedaUseCase } from "../../application/useCase/moneda.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js";

export class MonedaController {
    constructor(database) {
        this.monedaUseCase = new MonedaUseCase({ database });
    }

    createOneMoneda = async (req, res, next) => {
        try {
            const newMoneda = req.body;
            const result = await this.monedaUseCase.createOne(newMoneda);
            const response = ResponseApi.successfulRequest(result, 'La moneda ha sido creada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllMonedas = async (req, res, next) => {
        try {
            const monedas = await this.monedaUseCase.getAll();
            const response = ResponseApi.successfulRequest(monedas, 'Monedas obtenidas con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getOneMoneda = async (req, res, next) => {
        try {
            const { id_moneda } = req.params;
            const moneda = await this.monedaUseCase.getOne(Number(id_moneda));
            
            if (!moneda) {
                const response = ResponseApi.notFound('La moneda no ha sido encontrada', null);
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest(moneda, 'Moneda encontrada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    updateOneMoneda = async (req, res, next) => {
        try {
            const { id_moneda } = req.params;
            const updatedData = req.body;
            
            const updatedMoneda = await this.monedaUseCase.updateOne(Number(id_moneda), updatedData);
            const response = ResponseApi.successfulRequest(updatedMoneda, 'La moneda ha sido actualizada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    deleteOneMoneda = async (req, res, next) => {
        try {
            const { id_moneda } = req.params;
            await this.monedaUseCase.deleteOne(Number(id_moneda));
            const response = ResponseApi.successfulRequest(null, 'La moneda ha sido eliminada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}