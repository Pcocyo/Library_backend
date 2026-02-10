import { AccessTokenPayload, IJwtService } from "../security/interfaces";

import { Request, Response, NextFunction } from "express";
import { ClientErrorFactory } from "../error/exceptions";
import { ErrorMapperGroup } from "../error/mappers";
import { IAuthMiddleware,ValidateTokenOption } from "./types";

export default class AuthMiddleware implements IAuthMiddleware {
    private readonly jwtService: IJwtService;

    constructor(jwtService: IJwtService) {
        this.jwtService = jwtService;
        this.CreateValidateTokenMiddleware =
            this.CreateValidateTokenMiddleware.bind(this);
    }

    CreateValidateTokenMiddleware(
        parameter: ValidateTokenOption | undefined,
    ): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const token = this.extractToken(req);
                const decodedToken = this.jwtService.validateJwtToken(token);
                req = this.insertTokenInReq(req, decodedToken);
                this.executeOption(parameter, decodedToken, req);
                next();
            } catch (error: any) {
                error = ErrorMapperGroup.getInstance().mapError(error);
                next(error);
            }
        };
    }

    private extractToken(req: Request): string {
        const token = req.headers.authorization;
        if (token === undefined) {
            throw ClientErrorFactory.createUnauthorizedRequestError({
                context: { user_request_info: req.body },
                message: "Unauthorized Request",
            });
        }
        return token;
    }

    private insertTokenInReq(
        req: Request,
        decodedToken: AccessTokenPayload,
    ): Request {
        if (!req.body)
            req.body = {
                authorizedUser: decodedToken,
            };
        req.body.authorizedUser = decodedToken;
        return req;
    }

    private executeOption(
        parameter: ValidateTokenOption | undefined,
        decodedToken: AccessTokenPayload,
        req: Request,
    ): void {
        if (parameter === undefined) {
            return;
        } else {
            if (
                parameter.option.required_role !== decodedToken.role
            ) {
                throw ClientErrorFactory.createUnauthorizedRequestError({
                    context: { user_request_info: req.body },
                    message: "Unauthorized Request (User is not a librarian)",
                });
            }
            parameter.option.required_role;
        }
    }
}
