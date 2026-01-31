import { BaseRouter } from "../../core/base/base.router";
import type { Response, NextFunction } from "express";
import { UserService } from "./user.service";
import {
    CreateUserRequest,
    DeleteUserRequest,
    GetUserRequest,
    LoginUserRequest,
    UpdateUserRequest,
} from  "./types/user-router.types";
import Env from "../../Config/config";
import { ProfileService } from "../../features/profile";
import { ClientErrorFactory } from "../../Errors/ErrorClass";
import { validate } from "../../Middleware/validation-handler";
import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
    UpdateUserRequestSchema,
} from "../../Middleware/validation-handler/schema";

export class UserRouter extends BaseRouter {
    public constructor() {
        super();
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            "/create",
            validate(CreateUserRequestSchema),
            (req: CreateUserRequest, res: Response, next: NextFunction) => {
                this.createUser(req, res, next);
            },
        );

        this.router.get(
            "/get",
            this.validateToken,
            validate(GetUserRequestSchema),
            (req: GetUserRequest, res: Response, next: NextFunction) => {
                this.getUser(req, res, next);
            },
        );

        this.router.post(
            "/login",
            validate(LoginUserRequestSchema),
            (req: LoginUserRequest, res: Response, next: NextFunction) => {
                this.login(req, res, next);
            },
        );

        this.router.delete(
            "/delete",
            this.validateToken,
            (req: DeleteUserRequest, res: Response, next: NextFunction) => {
                this.deleteUser(req, res, next);
            },
        );

        this.router.put(
            "/update",
            this.validateToken,
            validate(UpdateUserRequestSchema),
            (req: UpdateUserRequest, res: Response, next: NextFunction) => {
                this.updateUser(req, res, next);
            },
        );
    }

    private async updateUser(
        req: UpdateUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { authorizedUser } = req.body;
            const userInstance = await UserService.getUserByEmail({
                email: authorizedUser.userEmail,
            });
            await userInstance.setEmail(req.body.email);
            await userInstance.setPassword(
                await Env.getGenerateBcrypt(req.body.password),
            );
            let newToken = Env.getGenerateJwtToken(userInstance);
            res.send({ token: newToken });
        } catch (error: any) {
            next(error);
        }
    }

    private async createUser(
        req: CreateUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            let cryptedPass: string = await Env.getGenerateBcrypt(
                req.body.password,
            );
            let user: UserService = await UserService.createNewUser({
                email: String(req.body.email),
                password: String(cryptedPass),
                role: null,
            });
            await ProfileService.CreateProfile({ user_id: user.getId() });
            const token = Env.getGenerateJwtToken(user);
            res.json({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async login(
        req: LoginUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const user = await UserService.getUserByEmail({ email: req.body.email });
            const correctPassword = await Env.getValidatePassword(
                req.body.password,
                user.getPassword(),
            );
            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: req.body.password,
                    context: { user_request_info: req.body },
                });
            }
            const token = Env.getGenerateJwtToken(user);
            res.send({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async getUser(
        req: GetUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userFound: UserService = await UserService.getUserByEmail({
                email: req.body.email,
            });
            res.send({
                id: userFound.getId(),
                email: userFound.getEmail(),
                role: userFound.getUserRole(),
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async deleteUser(
        req: DeleteUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { authorizedUser } = req.body;
            let userProfile: ProfileService = await ProfileService.GetByUserId({
                user_id: authorizedUser.userId,
            });
            await ProfileService.DeleteProfile(userProfile);
            await UserService.deleteUser({
                id: authorizedUser.userId,
                email: authorizedUser.userEmail,
            });
            res.send({
                message: `User ${authorizedUser.userEmail} deleted`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
