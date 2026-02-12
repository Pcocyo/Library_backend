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
import { IAuthMiddleware } from "../../../core/middleware/types";
import { AccessTokenPayload, IBcryptService, IJwtService } from "../../../core/security/interfaces";

import {
    UpdateUserRequestDto,
    LoginUserRequestDto,
    GetUserRequestDto,
    CreateUserRequestDto,
} from "./dto/request/user.request.dto";
import { UserRole } from "./types/user-service.types";

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

    private async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const updateUserDto: UpdateUserRequestDto =
                UpdateUserRequestDto.fromRequest(req);
            const userInstance = await UserService.getUserByEmail({
                email: updateUserDto.token.email,
            });
            await userInstance.setEmail(updateUserDto.data.email);
            updateUserDto.data.password &&
                (await userInstance.setPassword(
                    await this.bcryptService.hashPassword(
                        updateUserDto.data.password,
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
            const createUserDto: CreateUserRequestDto = req.body;
            let cryptedPass: string = await this.bcryptService.hashPassword(
                createUserDto.password,
            );
            let user: UserService = await UserService.createNewUser({
                email: String(createUserDto.email),
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
            const loginUserDto: LoginUserRequestDto = req.body;

            const user = await UserService.getUserByEmail({
                email: loginUserDto.email,
            });

            const correctPassword = await this.bcryptService.comparePassword(
                loginUserDto.password,
                user.getPassword(),
            );

            if (!correctPassword) {
                throw ClientErrorFactory.createIncorrectPasswordError({
                    field: loginUserDto.password,
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
            const getUserDto: GetUserRequestDto = req.body;
            const userFound: UserService = await UserService.getUserByEmail({
                email: getUserDto.email,
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
            const token:AccessTokenPayload = req.body.authorizedUser;
            let userProfile: ProfileService = await ProfileService.GetByUserId({
                user_id: token.id,
            });
            await ProfileService.DeleteProfile(userProfile);
            await UserService.deleteUser({
                id: token.id,
                email: token.email,
            });
            res.send({
                message: `User ${token.id} deleted`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
