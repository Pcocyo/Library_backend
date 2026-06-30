import { Request, Response,NextFunction } from "express";
import { UserRole } from "../../../features/v1/user/types";

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
