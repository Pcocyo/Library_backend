import { BaseRouter } from "../../../core/base/base.router";
import type { Response, NextFunction ,Request} from "express";
import { UserService } from "./user.service";
import {
    UserRouterConstructorParams,
} from "./types/user-router.types";
import Env from "../../../config/config";
import { ProfileService } from "../profile";
import { ClientErrorFactory } from "../../../core/error/exceptions/ClientError";
import { validate } from "../../../core/middleware/validation-handler/validation-handler.middleware";
import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
    UpdateUserRequestSchema,
} from "../../../core/middleware/validation-handler/schema";
import { IAuthMiddleware } from "../../../core/middleware/types";
import { IBcryptService, IJwtService } from "../../../core/security/interfaces";

export class UserRouter extends BaseRouter {
    private readonly authMiddleware: IAuthMiddleware;
    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;

    public constructor(userRouterParam: UserRouterConstructorParams) {
        super();
        this.authMiddleware = userRouterParam.authMiddleware;
        this.jwtService = userRouterParam.jwtService;
        this.bcryptService = userRouterParam.bcryptService;
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            "/create",
            validate(CreateUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.createUser(req, res, next);
            },
        );

        this.router.get(
            "/get",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            validate(GetUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.getUser(req, res, next);
            },
        );

        this.router.post(
            "/login",
            validate(LoginUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.login(req, res, next);
            },
        );

        this.router.delete(
            "/delete",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            (req: Request, res: Response, next: NextFunction) => {
                this.deleteUser(req, res, next);
            },
        );

        this.router.put(
            "/update",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            validate(UpdateUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.updateUser(req, res, next);
            },
        );
    }

    private async updateUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { authorizedUser } = req.body;
            const userInstance = await UserService.getUserByEmail({
                email: authorizedUser.email,
            });
            await userInstance.setEmail(req.body.email);
            await userInstance.setPassword(
                await this.bcryptService.hashPassword(req.body.password),
            );
            
            let newToken = this.jwtService.generateJwtToken({email:userInstance.getEmail(),id:userInstance.getId(),role:userInstance.getUserRole()});
            res.send({ token: newToken });
        } catch (error: any) {
            next(error);
        }
    }

    private async createUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            let cryptedPass: string = await this.bcryptService.hashPassword(
                req.body.password,
            );
            let user: UserService = await UserService.createNewUser({
                email: String(req.body.email),
                password: String(cryptedPass),
                role: null,
            });
            await ProfileService.CreateProfile({ user_id: user.getId() });

            const token = this.jwtService.generateJwtToken({
                email: user.getEmail(),
                id: user.getId(),
                role: user.getUserRole(),
            });

            res.json({
                token: token,
            });

        } catch (error: any) {
            next(error);
        }
    }

    private async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const user = await UserService.getUserByEmail({
                email: req.body.email,
            });
            const correctPassword = await this.bcryptService.comparePassword(
                req.body.password,
                user.getPassword(),
            );
            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: req.body.password,
                    context: { user_request_info: req.body },
                });
            }
            const token = this.jwtService.generateJwtToken({email:user.getUserRole(),id:user.getId(),role:user.getUserRole()});
            res.send({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async getUser(
        req: Request,
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
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { authorizedUser } = req.body;
            let userProfile: ProfileService = await ProfileService.GetByUserId({
                user_id: authorizedUser.id,
            });
            await ProfileService.DeleteProfile(userProfile);
            await UserService.deleteUser({
                id: authorizedUser.id,
                email: authorizedUser.email,
            });
            res.send({
                message: `User ${authorizedUser.id} deleted`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
