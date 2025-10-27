import type { PrismaClient } from "@prisma/client/extension";
import { Router } from "express";
import prisma from "../../prismaClient.js";

export abstract class RouterClass {
    protected router: Router;
    protected prisma: PrismaClient;

    public constructor() {
        this.prisma = prisma;
        this.router = Router();
    }
    public getRouter(): Router {
        return this.router;
    }
    protected abstract initializeRoutes(): void;
}
