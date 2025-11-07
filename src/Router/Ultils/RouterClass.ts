import type { PrismaClient } from "@prisma/client/extension";
import { Router,Response,Request,NextFunction } from "express";
import Env from "../../Config/config";
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
            if (!token) throw new Error("Unauthorized Request");
            if (!req.body) {
                req.body = {
                    authorizedUser: Env.getValidateToken(token),
                };
            } else {
                req.body.authorizedUser = Env.getValidateToken(token);
            }
            next();
        } catch (err: any) {
            res.status(400).send({ error: err.message });
        }
    }

    protected abstract initializeRoutes(): void;
}
