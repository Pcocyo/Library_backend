import { RouterClass } from "./Ultils/RouterClass.ts";
import type { Request, Response } from "express";
import User from "../Controller/User/User.ts";
export class UserRouter extends RouterClass {

    public constructor() {
        super();
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.get("/", (req: Request, res: Response) => {
            res.json({ message: "userRouter" });
        });
        this.router.post("/create", (req: Request, res: Response) =>
            this.createUser(req, res),
        );
    }

    private async createUser(req: Request, res: Response) {
        const { email, password } = req.body;
        User.createNewUser({email:email,password:password})
        try {
            res.json({email,password,message:"Holder"})
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }
}
