import { ProductoTerminadoUseCase } from "../../application/useCase/productoTerminado.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js";

export class ProductoTerminadoController {
    constructor(database) {
        this.productoTerminadoUseCase = new ProductoTerminadoUseCase({ database });
    }

    createOneProducto = async (req, res, next) => {
        try {
            const newProducto = req.body;
            const result = await this.productoTerminadoUseCase.createOne(newProducto);
            const response = ResponseApi.successfulRequest(result, 'El producto ha sido creado con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            console.log(error)
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllProductos = async (req, res, next) => {
        try {
            const productos = await this.productoTerminadoUseCase.getAll();
            const response = ResponseApi.successfulRequest(productos, 'Productos obtenidos con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getOneProducto = async (req, res, next) => {
        try {
            const { id_producto } = req.params;
            const producto = await this.productoTerminadoUseCase.getOne(Number(id_producto));
            
            if (!producto) {
                const response = ResponseApi.notFound('El producto no ha sido encontrado', null);
                return res.status(response.httpCode).json(response);
            }

            const response = ResponseApi.successfulRequest(producto, 'Producto encontrado con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    updateOneProducto = async (req, res, next) => {
        try {
            console.log(req.body)
            const { id_producto } = req.params;
            const updatedData = req.body;
            const updatedProducto = await this.productoTerminadoUseCase.updateOne(Number(id_producto), updatedData);
            const response = ResponseApi.successfulRequest(updatedProducto, 'El producto ha sido actualizado con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    deleteOneProducto = async (req, res, next) => {
        try {
            const { id_producto } = req.params;
            await this.productoTerminadoUseCase.deleteOne(Number(id_producto));
            const response = ResponseApi.successfulRequest(null, 'El producto ha sido eliminado con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}