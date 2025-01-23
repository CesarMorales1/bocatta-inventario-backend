import {HttpException,enumErrorCodes} from "./dataBaseExeptions.js"
export class BadRequestError extends  HttpException
{
    constructor(message,errorCode,error)
    {
        super(message,undefined,400,error);
    }
}