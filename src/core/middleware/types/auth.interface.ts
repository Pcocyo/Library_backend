import { Request, Response,NextFunction } from "express";

export type ValidateTokenOption = {
    option: {
        required_role: UserRole;
    };
};

export interface IAuthMiddleware {
    CreateValidateTokenMiddleware(
        parameter: ValidateTokenOption | undefined,
    ): (req: Request, res: Response, next: NextFunction) => void;
}
