import {AjusteUseCase} from "../../application/useCase/ajusteUseCase.js";
export class AjusteController
{
    constructor(database)
    {
        this.ajusteControllerUseCase = new AjusteUseCase({database});
    }

    createAnAjuste = async (req,res,next) => 
    {
        try {
            console.log(req.body)
            const {fecha_movimiento,observaciones,materias_primas}  = req.body;
            if(!fecha_movimiento || !observaciones || !materias_primas || !materias_primas.length)
                {
                    console.log('un error ah ocurrido');
                }
            //validando informacion del kardex a recibir
            //TODO: POR HACER
            
            const resultado = await this.ajusteControllerUseCase.realizarAjuste(
                {
                    tipo : "materia_prima",
                    fecha_movimiento: fecha_movimiento,
                    observaciones: observaciones,
                    materias_primas: materias_primas
                });
                res.status(200).json(resultado);
        } catch (error) {
            const response = error instanceof AppError ? error : ResponseApi.internalServerError(error.message);
            res.status(response.httpCode).json(response);
        }
    }
}