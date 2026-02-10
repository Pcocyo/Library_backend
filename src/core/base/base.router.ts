import { Router } from "express";

export abstract class BaseRouter {
    protected router: Router;

    public constructor() {
        this.router = Router();
    }

    public getRouter(): Router {
        return this.router;
    }
    protected abstract initializeRoutes(): void;
}
