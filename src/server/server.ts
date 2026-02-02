import type { Application } from "express";
import { DevApp } from "./app/dev-app";
import Env from "../config/config";
import { UserRouter } from "../features/user";
import { ProfileRouter } from "../features/profile";
import { errorHandler } from "../core/middleware/error-handler/error-handler.middleware";

export class Server {
    private app: Application;
    private userRouter: UserRouter;
    private profileRouter: ProfileRouter;

    private constructor(userRouter: UserRouter, profileRouter: ProfileRouter) {
        this.app = DevApp.getInstance().getApp();
        this.userRouter = userRouter;
        this.profileRouter = profileRouter;
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

    public static create(): Server {
        return new Server(new UserRouter(), new ProfileRouter());
    }
}
