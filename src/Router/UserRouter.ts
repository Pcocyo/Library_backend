import { RouterClass } from "./Ultils/RouterClass.js";
import type { Request, Response } from "express";

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
        try {
            const newUser = await this.prisma.users.create({
                data: {
                    email: email,
                    password: password,
                },
            });
            res.status(200).json(newUser);
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }
}
