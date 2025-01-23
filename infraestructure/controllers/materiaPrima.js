import { MateriaPrimaUseCase } from "../../application/useCase/MateriaPrimaUseCase.js";
import { ResponseApi } from "../../domain/entities/apiResponse.js";
import { MateriaPrima } from "../../domain/entities/MateriaPrima.js";

export class MateriaPrimaController {
    constructor(database) {
        this.materiaPrimaUseCase = new MateriaPrimaUseCase({ database });
    }

    // Crear nueva materia prima
    createOneMateriaPrima = async (req, res, next) => {
        try {
            const {codigo_barras} = req.body;
            if(!codigo_barras)
                {
                    const response = ResponseApi.badRequest("El código de barras de la materia prima es obligatorio");
                    res.status(response.httpCode).json(response);
                    return;
                }
            const materiaPrima = req.body;
            const newMateriaPrima = await this.materiaPrimaUseCase.createOne(materiaPrima);
            const result = ResponseApi.successfulRequest(
                "La materia prima ha sido creada con éxito",
                newMateriaPrima
            );
            res.status(result.httpCode).json(result);
        } catch (error) {
            res.status(error.httpCode || 500).json(error);
        }
    };

    // Obtener una materia prima por código de barras
    getOneMateriaPrima = async (req, res, next) => {
        try {
            const {codigo_barras} = req.body
            const existingMateriaPrima = await this.materiaPrimaUseCase.getOne(codigo_barras.at(0));

            if (!existingMateriaPrima) {
                const response = ResponseApi.notFound(
                    "La materia prima no ha sido encontrada",
                    `El código de barras ${codigo_barras} no existe`
                );
                res.status(response.httpCode).json(response);
                return;
            }

            const response = ResponseApi.successfulRequest(
                "La materia prima ha sido encontrada con éxito",
                existingMateriaPrima
            );
            console.log(response);
            res.status(response.httpCode).json(response);
        } catch (error) {
            console.log(error);
            res.status(error.httpCode || 500).json(error);
        }
    };

// Eliminar (borrado lógico) una materia prima por código de barras
deleteOneMateriaPrima = async (req, res, next) => {
    try {
        const { codigo_barras } = req.body;

        if (!codigo_barras) {
            const response = ResponseApi.badRequest("El código de barras de la materia prima es obligatorio");
            res.status(response.httpCode).json(response);
            return;
        }

        const deletedMateriaPrima = await this.materiaPrimaUseCase.deleteOne(codigo_barras);
        const response = ResponseApi.successfulRequest(
            "La materia prima ha sido eliminada (lógicamente) con éxito",
            deletedMateriaPrima
        );
        res.status(response.httpCode).json(response);
    } catch (error) {
        res.status(error.httpCode || 500).json(error);
    }
};

    // Obtener todas las materias primas
    getAllMateriaPrima = async (req, res, next) => {
        try {
            const materiasPrimas = await this.materiaPrimaUseCase.getAll();
            const response = ResponseApi.successfulRequest(
                "Todas las materias primas han sido obtenidas con éxito",
                materiasPrimas,
            );
            res.status(response.httpCode).json(response);
        } catch (error) {
            res.status(error.httpCode || 500).json(error);
        }
    };

    // Actualizar una materia prima
    updateOneMateriaPrima = async (req, res, next) => {
        try {
            const { codigo_barras, ...updatedData } = req.body;
            console.log(codigo_barras)
            if (!codigo_barras) {
                const response = ResponseApi.badRequest("El ID de la materia prima es obligatorio");
                res.status(response.httpCode).json(response);
                return;
            }
            const newMateriaPrima = new MateriaPrima({codigo_barras,...updatedData});
            const updatedMateriaPrima = await this.materiaPrimaUseCase.editOne(
                codigo_barras,
                newMateriaPrima
            );
            const response = ResponseApi.successfulRequest(
                "La materia prima ha sido actualizada con éxito",
                updatedMateriaPrima
            );
            res.status(response.httpCode).json(response);
        } catch (error) {
            console.log(error);
            res.status(error.httpCode || 500).json(error);
        }
    };
}
