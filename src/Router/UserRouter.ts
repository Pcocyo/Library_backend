import { RouterClass } from "./Ultils/RouterClass.ts";
import type { Request, Response } from "express";
import User from "../Controller/User/User.ts";
import Env from "../Config/config.ts";
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
        try {
            const { email, password } = req.body;
            this.validateEmail(email);
            this.validatePassword(password);
            let cryptedPass: string = await Env.getGenerateBcrypt(password);
            let user = await User.createNewUser({
            email: String(email),
            password: String(cryptedPass),
            role: null,
        });
            const jwtToken = Env.getGenerateJwtToken(user);
            res.json(
                {
                    token : jwtToken 
                }
            );
        } catch (err: any) {
            res.status(400).json(err.message);
        }
    }

    private validateEmail(emailToTest: string): Error | null {
        const emailRegx: RegExp =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegx.test(emailToTest)) {
            throw new Error("Invalid email");
        }
        return null;
    }

    private validatePassword(passwordToTest: string): Error | null {
        const passwordRegx: RegExp =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/
        if (!passwordRegx.test(passwordToTest)) {
            throw new Error("Invalid password, password must contain at least 1 special characther, capital letter, number, and in between 8-32 words");
        }
        return null;
    }
}
