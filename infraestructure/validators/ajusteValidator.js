import { AppError } from "../../domain/exeptions/AppError";
import { Validator } from "../../utils/validator";

const ajusteInputs = 
{
    fecha_movimiento: "isAValidDate",
    observaciones   : "isTextWithoutNumbers",
    materias_primas : "isAnArray"
}