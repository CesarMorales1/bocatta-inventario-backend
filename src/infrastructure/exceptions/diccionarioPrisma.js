import {HttpException} from "../exceptions/dataBaseExeptions.js"
import {enumErrorCodes} from "./dataBaseExeptions.js"
export const diccionarioPrisma = 
{
    P2025 : new HttpException('La operacion ah fallado porque depende de uno o dos parametros que no han sido encontrados',enumErrorCodes.RECORD_NOT_FOUND),
    P2002 : new HttpException('El elemento se encuentra repetido en la base de datos',400,400,enumErrorCodes.REGISTER_ALREADY_EXIST),
}