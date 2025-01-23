import { FacturaUseCase } from "../../application/useCase/factura.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js";

export class FacturaController {
    constructor(database) {
        this.facturaUseCase = new FacturaUseCase({ database });
    }

    createOneFactura = async (req, res, next) => {
        try {
            const {detalle_factura:items,...facturaInformation} = req.body;
            const result = await this.facturaUseCase.createFacturaConDetalles(facturaInformation,items);
            const response = ResponseApi.successfulRequest(result, 'La factura ha sido creada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    deleteOneFactura = async (req, res, next) => {
        try {
            const { id_factura } = req.params;
            const result = await this.facturaUseCase.deleteOne(Number(id_factura));
            const response = ResponseApi.successfulRequest(result, 'La factura ha sido desactivada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllFacturas = async (req, res, next) => {
        try {
            const facturas = await this.facturaUseCase.getAll();
            const response = ResponseApi.successfulRequest(facturas, 'Facturas obtenidas con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getOneFactura = async (req, res, next) => {
        try {
            const { id_factura } = req.params;
            const factura = await this.facturaUseCase.getOne(Number(id_factura));
            
            if (!factura) {
                const response = ResponseApi.notFound('La factura no ha sido encontrada', null);
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest(factura, 'Factura encontrada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    updateOneFactura = async (req, res, next) => {
        try {
            const { id_factura } = req.params;
            const updatedData = req.body;
            
            const updatedFactura = await this.facturaUseCase.updateOne(Number(id_factura), updatedData);
            const response = ResponseApi.successfulRequest(updatedFactura, 'La factura ha sido actualizada con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}