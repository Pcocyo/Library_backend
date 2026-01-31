import { Request, Response, NextFunction } from "express";
import {  ClientError, DbError, ValidationError } from "../../../Errors/ErrorClass";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (err instanceof ClientError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    if (err instanceof ValidationError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    if (err instanceof DbError) {
        return res.status(err.httpsStatusCode).send(err.toClientResponse());
    }
    res.status(500).json({ message: "Internal server error", error: err });
};
