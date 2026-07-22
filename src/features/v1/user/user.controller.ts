import {
    GetUserResponseDto,
    UpdateUserDto,
    LoginUserDto,
    CreateUserDto,
    DeleteUserDto,
    GetUserDto,
    ActivateMembershipDto,
    AssignLibrarianDto,
} from "./dto";
import { Request, Response, NextFunction } from "express";
import { IUserController, IUserEntity, IUserService } from "./types";

export class UserController implements IUserController {
    private readonly userService: IUserService;

    public constructor(userService: IUserService) {
        this.userService = userService;
        this.updateUser = this.updateUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.login = this.login.bind(this);
        this.getUser = this.getUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.activate_membership = this.activate_membership.bind(this);
        this.assign_librarian = this.assign_librarian.bind(this);
    }

    public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: UpdateUserDto = UpdateUserDto.fromRequest(req);
            const newToken = await this.userService.update(payload as UpdateUserDto);
            res.send({ token: newToken });
        } catch (error: any) {
            next(error);
        }
    }

    public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: CreateUserDto = req.body;
            let token = await this.userService.create(payload);
            res.send({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: LoginUserDto = req.body;
            const token = await this.userService.compare(payload);
            res.send({
                token: token,
            });
        } catch (error: any) {
            next(error);
        }
    }

    public async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload: GetUserDto = GetUserDto.fromRequest(req);
            const user: IUserEntity = await this.userService.findUser(payload);
            res.send(GetUserResponseDto.extract(user).toResponse());
        } catch (error: any) {
            next(error);
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload = DeleteUserDto.fromRequest(req);
            await this.userService.delete(payload);
            res.send({
                message: `User ${payload.token.id} deleted`,
            });
        } catch (error: any) {
            next(error);
        }
    }

    public async activate_membership(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload = ActivateMembershipDto.fromRequest(req);
            const token_memberRole = await this.userService.activate_membership(payload);
            res.send({ token: token_memberRole });
        } catch (error: any) {
            next(error);
        }
    }

    public async assign_librarian(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = AssignLibrarianDto.fromRequest(req);
            this.userService.assign_librarian(dto);
            res.send({ message: "success" });
        } catch (error: any) {
            next(error);
        }
    }
}
