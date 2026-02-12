import { IValidationMiddleware } from "./types/validation.interface";
import { Request, Response, NextFunction } from "express";
import { ValidationErrorFactory } from "../error/exceptions";
import { ZodError,ZodType } from "zod";

export class ValidationMiddleware implements IValidationMiddleware {
    public constructor() {
      this.validate = this.validate.bind(this);
   }
    public validate<T extends ZodType>(
        schema: T,
    ): (req: Request, res: Response, next: NextFunction) => void {
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
    }
}
