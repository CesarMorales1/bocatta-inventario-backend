export class ResponseApi {
    constructor({ description, httpCode, success, information }) {
        this.description = description || '';
        this.httpCode = httpCode || 200; // Default 200 OK
        this.success = success; // Default success is true
        this.information = information || null; // Can be any extra information
    }

    static successfulRequest(description = 'Request was successful', information = null) {
        return new ResponseApi({
            description,
            httpCode: 200,
            success: true,
            information
        });
    }

    static badRequest(description = 'Bad Request', information = null) {
        return new ResponseApi({
            description,
            httpCode: 400,
            success: false,
            information
        });
    }

    static notFound(description = 'Resource not found', information = null) {
        return new ResponseApi({
            description,
            httpCode: 404,
            success: false,
            information
        });
    }

    static internalServerError(description = 'Internal server error', information = null) {
        return new ResponseApi({
            description,
            httpCode: 500,
            success: false,
            information
        });
    }

    static unauthorized(description = 'Unauthorized access', information = null) {
        return new ResponseApi({
            description,
            httpCode: 401,
            success: false,
            information
        });
    }

    static forbidden(description = 'Forbidden', information = null) {
        return new ResponseApi({
            description,
            httpCode: 403,
            success: false,
            information
        });
    }
}
