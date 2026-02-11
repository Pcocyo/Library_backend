import { Request } from "express";
import { IAuthMiddleware } from "../../../../core/middleware/types";
import { IBcryptService, IJwtService } from "../../../../core/security/interfaces";

interface BasicUserData {
    email: string;
    password: string;
}

export interface LoginUserRequest extends Request {
    body: BasicUserData;
}

export interface UserRouterConstructorParams{
    authMiddleware: IAuthMiddleware,
    jwtService: IJwtService
    bcryptService: IBcryptService
}
