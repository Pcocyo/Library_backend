import { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";
import { ValidationErrorFactory } from "../../../Errors/ErrorClass";

export const validate = <T extends z.ZodSchema>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body, { reportInput: true });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationError =
                    ValidationErrorFactory.createInvalidInputError({
                        field: String(error.issues[0].path),
                        value: String(error.issues[0].input),
                        message: error.issues[0].message,
                        code: error.issues[0].code,
                        context: error,
                    });
                next(validationError);
            } else next(error);
        }
    };
};
