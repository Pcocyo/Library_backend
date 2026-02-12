import { BaseRouter } from "../../../core/base/base.router";
import type { Response, NextFunction, Request } from "express";
import { UserService } from "./user.service";
import { UserRouterConstructorParams } from "./types/user-router.types";
import { ProfileService } from "../profile";
import { ClientErrorFactory } from "../../../core/error/exceptions/ClientError";
import { validate } from "../../../core/middleware/validation-handler/validation-handler.middleware";
import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
    UpdateUserRequestSchema,
} from "./user.schema";
import {
    IAuthMiddleware,
    IValidationMiddleware,
} from "../../../core/middleware/types";
import { IBcryptService, IJwtService } from "../../../core/security/interfaces";
import {
    UpdateUserDto,
    LoginUserDto,
    CreateUserDto,
    DeleteUserDto,
    GetUserDto,
} from "./dto";
import { UserRole } from "./types/user-service.types";

export class UserRouter extends BaseRouter {
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;

    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;

    public constructor(userRouterParam: UserRouterConstructorParams) {
        super();
        this.authMiddleware = userRouterParam.authMiddleware;
        this.validationMiddleware = userRouterParam.validationMiddleware;
        this.jwtService = userRouterParam.jwtService;
        this.bcryptService = userRouterParam.bcryptService;
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.post(
            "/create",
            this.validationMiddleware.validate(CreateUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.createUser(req, res, next);
            },
        );

        this.router.get(
            "/get",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.validationMiddleware.validate(GetUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.getUser(req, res, next);
            },
        );

        this.router.post(
            "/login",
            this.validationMiddleware.validate(LoginUserRequestSchema),
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
            this.validationMiddleware.validate(UpdateUserRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.updateUser(req, res, next);
            },
        );
    }

    private async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: UpdateUserDto = UpdateUserDto.fromRequest(req);
            const userInstance = await UserService.getUserByEmail({
                email: payload.token.email,
            });
            await userInstance.setEmail(payload.data.email);
            payload.data.password &&
                (await userInstance.setPassword(
                    await this.bcryptService.hashPassword(
                        payload.data.password,
                    ),
                ));

            let newToken = this.jwtService.generateJwtToken({
                email: userInstance.getEmail(),
                id: userInstance.getId(),
                role: userInstance.getUserRole(),
            });
            res.send({ token: newToken });
        } catch (error: any) {
            next(error);
        }
    }

    private async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: CreateUserDto = req.body;
            let cryptedPass: string = await this.bcryptService.hashPassword(
                payload.password,
            );
            let user: UserService = await UserService.createNewUser({
                email: String(payload.email),
                password: String(cryptedPass),
                role: UserRole.GUEST,
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

    private async login(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: LoginUserDto = req.body;

            const user = await UserService.getUserByEmail({
                email: payload.email,
            });

            const correctPassword = await this.bcryptService.comparePassword(
                payload.password,
                user.getPassword(),
            );

            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: payload.password,
                    context: { user_request_info: req.body },
                });
            }

            const token = this.jwtService.generateJwtToken({
                email: user.getUserRole(),
                id: user.getId(),
                role: user.getUserRole(),
            });

            res.send({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: GetUserDto = GetUserDto.fromRequest(req);
            const userFound: UserService = await UserService.getUserByEmail({
                email: payload.data.email,
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

    private async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = DeleteUserDto.fromRequest(req);
            let userProfile: ProfileService = await ProfileService.GetByUserId({
                user_id: payload.token.id,
            });
            await ProfileService.DeleteProfile(userProfile);
            await UserService.deleteUser({
                id: payload.token.id,
                email: payload.token.email,
            });
            res.send({
                message: `User ${payload.token.id} deleted`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
