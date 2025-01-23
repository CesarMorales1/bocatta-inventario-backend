import { ConversionFactorUseCase } from "../../application/useCase/ConversionFactor.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"

export class ConversionFactorController {
    constructor(database) {
        this.conversionFactorUseCase = new ConversionFactorUseCase({ database });
    }

    getAllConversionFactors = async (req, res, next) => {
        try {
            const factors = await this.conversionFactorUseCase.getAll();
            const response = ResponseApi.successfulRequest(factors, 'Factores de conversión obtenidos con éxito');
            res.status(response.httpCode).json(response);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}