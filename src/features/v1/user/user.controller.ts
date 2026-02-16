import { UserService } from "./user.service";
import {
    UpdateUserDto,
    LoginUserDto,
    CreateUserDto,
    DeleteUserDto,
    GetUserDto,
} from "./dto";
import { ProfileService } from "../profile";
import { Request, Response, NextFunction } from "express";
import { IBcryptService, IJwtService } from "../../../core/security/interfaces";
import { IUserController,UserRole } from "./types";
import { ClientErrorFactory } from "../../../core/error/exceptions";

export class UserController implements IUserController {
    private readonly bcryptService: IBcryptService;
    private readonly jwtService: IJwtService;
    public constructor(bcryptService: IBcryptService, jwtService: IJwtService) {
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
        this.updateUser = this.updateUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.login = this.login.bind(this);
        this.getUser = this.getUser.bind(this);
    }

    public async updateUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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

    public async createUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const payload: CreateUserDto = req.body;
            let cryptedPass: string = await this.bcryptService.hashPassword(
                payload.password,
            );
            let user: UserService = await UserService.createNewUser({
                email: String(payload.email),
                password: String(cryptedPass),
                role: "GUEST",
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

    public async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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

    public async getUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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

    public async deleteUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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
