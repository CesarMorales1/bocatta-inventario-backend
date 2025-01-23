export class HttpException extends Error
{
    constructor(message,errorCode,statusCode,error)
    {
        super(message);
        this.errorCode  = errorCode;
        this.statusCode = statusCode;
        this.error      = error
    }
}

export class enumErrorCodes
{
    static REGISTER_ALREADY_EXIST = 400;
    static RECORD_NOT_FOUND       = 404;
    static BAD_REQUEST            = 401;
    static INTERNAL_ERROR         = 500;
}