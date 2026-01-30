import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { Request } from "express";

interface BasicUserData {
    email: string;
    password: string;
}

interface GetUserRequestBody extends UserJwtPayloadInterface {
    email: string;
}

export interface CreateUserRequest extends Request {
    body: BasicUserData;
}

export interface GetUserRequest extends Request {
    body: GetUserRequestBody;
}

export interface UpdateUserRequest extends Request {
    body: {
        email: string;
        password: string;
        authorizedUser: UserJwtPayloadInterface;
    };
}

export interface DeleteUserRequest extends Request {
    body: {
        authorizedUser: UserJwtPayloadInterface;
    };
}

export interface LoginUserRequest extends Request {
    body: BasicUserData;
}
