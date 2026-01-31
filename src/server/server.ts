import type { Request, Response, Application } from "express";
import { DevApp } from "./app/dev-app";
import Env from "../config/config";
import { UserRouter } from "../features/user";
import { ProfileRouter } from "../features/profile";
import { errorHandler } from "../core/middleware/error-handler/error-handler.middleware";


export class Server {
    private app: Application;
    private static instance: Server | null;
    private userRouter = new UserRouter();
    private profileRouter = new ProfileRouter();

    private constructor() {
        this.app = DevApp.getInstance().getApp();
        this.routes();
    }

    private routes(): void {
        this.app.use("/user", this.userRouter.getRouter());
        this.app.use("/profile", this.profileRouter.getRouter());
        this.app.use(errorHandler);
    }

    public start(): void {
        this.app.listen(Env.getPORT(), () => {
            console.log(`listening on port ${Env.getPORT()}`);
        });
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
            return Server.instance;
        } else {
            return Server.instance;
        }
    }
}
