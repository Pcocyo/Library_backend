import type { Application } from "express";
import { DevApp } from "./app/dev-app";
import { errorHandler } from "../core/middleware/error-handler/error-handler.middleware";
import  UserModule  from "../features/v1/user/user.module";
import AuthMiddleware from "../core/middleware/auth.middleware";
import { ProfileModule } from "../features/profile/profile.module";
import { IAppConfig } from "../config/config.interface";
import JwtService from "../core/security/jwt.service";

export default class Server {
    private app: Application;
    private userModule: UserModule;
    private profileModule: ProfileModule;
    private appConfig: IAppConfig;

    private constructor(
        userModule: UserModule,
        profileModule: ProfileModule,
        appConfig: IAppConfig,
    ) {
        this.app = DevApp.getInstance().getApp();
        this.userModule = userModule;
        this.profileModule = profileModule;
        this.appConfig = appConfig;
        this.routes();
    }

    private routes(): void {
        this.app.use("/user", this.userModule.getRouter());
        this.app.use("/profile", this.profileModule.getRouter());
        this.app.use(errorHandler);
    }

    public start(): void {
        this.app.listen(this.appConfig.ServerConfig.PORT, () => {
            console.log(`listening on port ${this.appConfig.getServerConfig().PORT}`);
        });
    }

    public static create(application_configuration: IAppConfig): Server {
        let jwtService: JwtService = new JwtService(application_configuration.getSecurityConfig());

        return new Server(
            new UserModule(new AuthMiddleware(jwtService)),
            new ProfileModule(),
            application_configuration,
        );
    }
}
