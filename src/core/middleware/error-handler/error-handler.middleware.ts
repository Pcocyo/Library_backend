import { Request, Response, NextFunction } from "express";
import { ClientError, ValidationError, DbError } from "../../error/exceptions";
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ClientError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    if (err instanceof ValidationError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    if (err instanceof DbError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    return res.status(500).json({
        message: "Internal server error",
        error: {
            name: err.name,
            message: err.message,
            cause: err.cause,
            stack: err.stack,
        },
    });
};
