import type { Application } from "express";
import { DevApp } from "./app/dev-app";
import Env from "../config/config";
import { ProfileRouter } from "../features/profile";
import { errorHandler } from "../core/middleware/error-handler/error-handler.middleware";
import { UserModule } from "../features/user/user.module";
import { ProfileModule } from "../features/profile/profile.module";

export class Server {
    private app: Application;
    private userModule: UserModule;
    private profileModule: ProfileModule;

    private constructor(userModule: UserModule, profileModule: ProfileModule) {
        this.app = DevApp.getInstance().getApp();
        this.userModule = userModule;
        this.profileModule = profileModule;
        this.routes();
    }

    private routes(): void {
        this.app.use("/user", this.userModule.getRouter());
        this.app.use("/profile", this.profileModule.getRouter());
        this.app.use(errorHandler);
    }

    public start(): void {
        this.app.listen(Env.getPORT(), () => {
            console.log(`listening on port ${Env.getPORT()}`);
        });
    }

    public static create(): Server {
        return new Server(new UserModule(), new ProfileModule());
    }
}
