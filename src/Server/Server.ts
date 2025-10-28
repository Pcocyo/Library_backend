import type { Request, Response, Application } from "express";
import { DevApp } from "./App/DevApp.js";
import Env from "../Config/config.ts";
import { UserRouter } from "../Router/UserRouter.ts";

export class Server {
    private app: Application;
    private static instance: Server | null;
    private userRouter = new UserRouter();

    private constructor() {
        this.app = DevApp.getInstance().getApp();
        this.routes();
    }

    private routes(): void {
        this.app.get("/", (req: Request, res: Response) => { res.json({ message: "success" }) });
        this.app.use("/user", this.userRouter.getRouter());
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

