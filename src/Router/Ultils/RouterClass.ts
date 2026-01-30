import { Router, Response, Request, NextFunction } from "express";
import Env from "../../Config/config";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { UserRole } from "../../Controller/User/User";
import { ClientErrorFactory } from "../../Errors/ErrorClass";
import { ErrorMapperGroup } from "../../Errors/ErrorMapper/";
export abstract class RouterClass {
    protected router: Router;

    public constructor() {
        this.router = Router();
    }

    public getRouter(): Router {
        return this.router;
    }

    protected validateToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw ClientErrorFactory.createUnauthorizedRequestError({
                    context: { user_request_info: req.body },
                    message: "Unauthorized Request",
                });
            }
            if (!req.body)
                req.body = { authorizedUser: Env.getValidateToken(token) };
            req.body.authorizedUser = Env.getValidateToken(token);
            next();
        } catch (error: any) {
            error = ErrorMapperGroup.getInstance().mapError(error);
            next(error);
        }
    }

    protected validateLibrarianToken(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        function isLibrarian(payloadToken: UserJwtPayloadInterface): boolean {
            if (payloadToken.userRole === UserRole.LIBRARIAN) return true;
            return false;
        }
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw ClientErrorFactory.createUnauthorizedRequestError({
                    context: { user_request_info: req.body },
                    message: "Unauthorized Request",
                });
            }
            const parsedToken = Env.getValidateToken(token);
            if (!isLibrarian(parsedToken)) {
                throw ClientErrorFactory.createUnauthorizedRequestError({
                    context: { user_request_info: req.body },
                    message: "Unauthorized Request (User is not a librarian)",
                });
            }
            if (!req.body) req.body = { authorizedUser: parsedToken };
            req.body.authorizedUser = parsedToken;
            next();
        } catch (error: any) {
            error = ErrorMapperGroup.getInstance().mapError(error);
            next(error);
        }
    }
    protected abstract initializeRoutes(): void;
}
