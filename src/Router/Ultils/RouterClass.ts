import type { PrismaClient } from "@prisma/client/extension";
import { Router } from "express";

export abstract class RouterClass {
    protected router: Router;
    public constructor() {
        this.router = Router();
    }
    public getRouter(): Router {
        return this.router;
    }
    protected abstract initializeRoutes(): void;
}
