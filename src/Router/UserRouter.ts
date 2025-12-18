import { RouterClass } from "./Ultils/RouterClass";
import type { NextFunction, Request, Response } from "express";
import User, { UserRole } from "../Controller/User/User";
import Env from "../Config/config";
import Profile from "../Controller/Profile/Profile";
import ProfileRouter from "./ProfileRouter";

export default class UserRouter extends RouterClass {
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

        this.router.get(
            "/getUser",
            this.validateToken,
            (req: Request, res: Response) => {
                this.getUser(req, res);
            },
        );

        this.router.post("/login", (req: Request, res: Response) => {
            this.login(req, res);
        });

        this.router.delete(
            "/delete",
            this.validateToken,
            (req: Request, res: Response) => {
                this.deleteUser(req, res);
            },
        );

        this.router.put(
            "/update",
            this.validateToken,
            (req: Request, res: Response) => {
                this.updateUser(req, res);
            },
        );
    }


    private async updateUser(req: Request, res: Response) {
        try {
            const { authorizedUser, updateData } = req.body;

            if (updateData.email) this.validateEmail(updateData.email);
            if (updateData.password) this.validatePassword(updateData.password);
            if (updateData.role) {
                if (!UserRole[updateData.role as keyof typeof UserRole]) {
                    throw new Error("Role inserted was invalid");
                }
            }
            const userInstance = await User.getUserByEmail({
                email: authorizedUser.userEmail,
            });
            await userInstance.setEmail(updateData.email);
            await userInstance.setPassword(await Env.getGenerateBcrypt(updateData.password));
            await userInstance.setRole(updateData.role);
            let newToken = Env.getGenerateJwtToken(userInstance);
            res.send({ token: newToken });
        } catch (err: any) {
            res.status(400).send({
                error: err.message,
            });
        }
    }

    private async createUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            this.validateEmail(email);
            this.validatePassword(password);
            let cryptedPass: string = await Env.getGenerateBcrypt(password);
            let user: User = await User.createNewUser({
                email: String(email),
                password: String(cryptedPass),
                role: null,
            });
            await Profile.CreateProfile({user_id:user.getId()});
            const token = Env.getGenerateJwtToken(user);
            res.json({
                token: token,
            });
        } catch (err: any) {
            res.status(400).json({
                error: err.message,
            });
        }
    }

    private async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            this.validateEmail(email);
            this.validatePassword(password);
            const user = await User.getUserByEmail({ email: email });
            const correctPassword = await Env.getValidatePassword(
                password,
                user.getPassword(),
            );

            if (!correctPassword) {
                throw new Error("Incorrect password");
            }
            const token = Env.getGenerateJwtToken(user);
            res.send({
                token: token,
            });
        } catch (err: any) {
            res.status(400).send({ error: err.message });
        }
    }
    
    private async getUser(req: Request, res: Response) {
        try {
            const { email } = req.body;
            this.validateEmail(email);
            const userFound: User = await User.getUserByEmail({ email: email });
            res.send({
                id: userFound.getId(),
                email: userFound.getEmail(),
                role: userFound.getUserRole(),
            });
        } catch (err: any) {
            res.status(400).send({
                error: err.message,
            });
        }
    }

    private async deleteUser(req: Request, res: Response) {
        try {
            const { authorizedUser } = req.body;
            let userProfile:Profile = await Profile.GetByUserId({user_id:authorizedUser.userId});
            await Profile.DeleteProfile(userProfile);
            await User.deleteUser({
                id: authorizedUser.userId,
                email: authorizedUser.userEmail,
            });
            res.send({
                message: `User ${authorizedUser.userEmail} deleted`,
            });
        } catch (err: any) {
            res.status(400).send({
                error: err.message,
            });
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
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;
        if (!passwordRegx.test(passwordToTest)) {
            throw new Error(
                "Invalid password, password must contain at least 1 special characther, capital letter, number, and in between 8-32 words",
            );
        }
        return null;
    }
}
