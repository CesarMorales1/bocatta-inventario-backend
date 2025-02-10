import { RecetaUseCase } from "../../application/useCase/receta.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js";

export class RecetaController {
    constructor(database) {
        this.recetaUseCase = new RecetaUseCase({ database });
    }

    createFromProduct = async (req, res, next) => {
        try {
            const productData = req.body;
            const result = await this.recetaUseCase.createFromProduct(productData);
            const response = ResponseApi.successfulRequest(result, 'Las recetas han sido creadas con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }

    getAllReceta = async (req, res, next) => {
        try {
            //obtener todas las recetas con productos especiales
            const recetas = await this.recetaUseCase.getAll();
            const response = ResponseApi.successfulRequest(
                "Todas las recetas han sido obtenidas con éxito",
                recetas,
            );
            res.status(response.httpCode).json(response);
        } catch (error) {
            res.status(error.httpCode || 500).json(error);
        }
    };

    // updateOneReceta = async (req, res, next) => {
    //     try {
    //         const productoTerminadoUseCase = new ProductoTerminadoUseCase({ database });
    //         // console.log(req.body.recetaData.materias_primas);
    //         const { id_receta,recetaData } = req.body;
    //         //agregando validacion que el producto se encuentra en la base de datos
    //         const producto = await this.productoTerminadoUseCase.getOne(id_receta);
    //         if (!producto) {
    //             const response = ResponseApi.notFound('La receta no se encuentra en la base de datos');
    //             res.status(response.httpCode).json(response);
    //             return;
    //         }
    //         //manejo la logica de negocio
    //         const recetaEntity = new Receta(recetaData);
    //         const result = await this.recetaUseCase.updateOneReceta(id_receta, recetaEntity, productoTerminadoUseCase);
    //         const response = ResponseApi.successfulRequest(result, 'La receta ha sido actualizada con éxito');
    //         res.status(response.httpCode).json(response);
    //     } catch (error) {
    //         console.log(error);
    //         const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
    //         res.status(response.httpCode).json(response);
    //     }
    // }
}
