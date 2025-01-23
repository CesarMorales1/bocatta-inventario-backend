import {KardexMateriaPrima} from "../../application/useCase/kardexMateriaPrima.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js"

export class KardexMateriaPrimaController
{
    constructor(database)
    {
        this.kardexMateriaUseCase = new KardexMateriaPrima(database);
    }

    getAllKardex = async (req,res) => 
        {
            try {
                const kadexMateria = await this.kardexMateriaUseCase.getAll();
                const response = ResponseApi.successfulRequest('Kardex obtenido con exito',kadexMateria)
                res.status(response.httpCode).json(response);
            } catch (error) {
                console.log(error)
                res.status(error.httpCode).json(error);
                return;
            }
        }
}