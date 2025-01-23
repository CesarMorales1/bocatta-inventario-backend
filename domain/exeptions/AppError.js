//Error centralizado que deriva de Node error
export class AppError extends Error
{
    constructor(nombre,httpCode,description,isOperational)
    {
        super(description);
        Object.setPrototypeOf(this,new.target.prototype);
        this.nombre = nombre;
        this.httpCode = httpCode;
        this.isOperational = isOperational; //si el error es predecible
    }
}