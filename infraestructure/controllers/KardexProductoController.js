import { KardexProductoUseCase } from "../../application/useCase/KardexProducto.js";
import { ResponseApi } from "../../domain/entities/apiResponse.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class KardexProductoController {
    constructor(database) {
        this.kardexProductoUseCase = new KardexProductoUseCase({ database });
    }

    procesarArchivoVentas = async (req, res) => {
        try {
            const ventasData = req.body;
            const result = await this.kardexProductoUseCase.procesarArchivoVentas(ventasData);
            // console.log(result);
            const response = ResponseApi.successfulRequest('Archivo de ventas procesado exitosamente', result);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    createOneKardex = async (req, res) => {
        try {
            const kardexData = req.body;
            const result = await this.kardexProductoUseCase.createOne(kardexData);
            const response = ResponseApi.successfulRequest('Movimiento de kardex registrado con éxito', result);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllKardex = async (req, res) => {
        try {
            const kardexProductos = await this.kardexProductoUseCase.getAll();
            const response = ResponseApi.successfulRequest('Registros de kardex obtenidos con éxito', kardexProductos);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getKardexByProduct = async (req, res) => {
        try {
            const { id_producto } = req.params;
            const kardexProductos = await this.kardexProductoUseCase.getByProductId(id_producto);
            const response = ResponseApi.successfulRequest('Registros de kardex del producto obtenidos con éxito', kardexProductos);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getOneKardex = async (req, res) => {
        try {
            const { id_kardex } = req.params;
            const kardexProducto = await this.kardexProductoUseCase.getOne(id_kardex);
            
            if (!kardexProducto) {
                const response = ResponseApi.notFound('Registro de kardex no encontrado');
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest('Registro de kardex encontrado con éxito', kardexProducto);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    obtenerKardexPorReferencia = async (req, res) => {
        try {
            const { referencia } = req.params;
            const kardexProducto = await this.kardexProductoUseCase.obtenerKardexPorReferencia(referencia);
            
            if (!kardexProducto) {
                const response = ResponseApi.notFound('Registro de kardex no encontrado');
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest('Registro de kardex encontrado con éxito', kardexProducto);
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}