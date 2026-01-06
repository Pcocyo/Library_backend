import type { Request, Response, Application } from "express";
import { DevApp } from "./App/DevApp";
import Env from "../Config/config";
import  UserRouter  from "../Router/UserRouter";
import ProfileRouter from "../Router/ProfileRouter";

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
        this.app.use("/profile",this.profileRouter.getRouter());
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
        }
        else {
            return Server.instance;
        }
    }
}

