import { UserRepository, UserRouter, UserService } from "./v1/user/";
import {
    IAuthMiddleware,
    IValidationMiddleware,
} from "../core/middleware/types";
import { IBcryptService, IJwtService } from "../core/security/interfaces";
import {
    IUserController,
    IUserRepository,
    IUserService,
} from "./v1/user/types";
import { UserController } from "./v1/user/user.controller";
import { PrismaClient } from "@prisma/client";
export default class UserModule {
    private readonly userRouter: UserRouter;

    //middleware used
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;

    //service used
    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;
    private readonly userController: IUserController;
    private readonly userRepository: IUserRepository;
    private readonly prisma: PrismaClient;
    private readonly userService: IUserService;
    constructor(
        authMiddleware: IAuthMiddleware,
        validationMiddleware: IValidationMiddleware,
        jwtService: IJwtService,
        bcryptService: IBcryptService,
        prisma: PrismaClient,
    ) {
        this.jwtService = jwtService;
        this.authMiddleware = authMiddleware;
        this.bcryptService = bcryptService;
        this.validationMiddleware = validationMiddleware;
        this.prisma = prisma;
        this.userRepository = new UserRepository(this.prisma);
        this.userService = new UserService({
            userRepository: this.userRepository,
            jwtService: this.jwtService,
            bcryptService: this.bcryptService,
        });

        this.userController = new UserController(this.userService);
        this.userRouter = new UserRouter(
            this.authMiddleware,
            this.validationMiddleware,
            this.userController,
        );
    }

    public getRouter() {
        return this.userRouter.getRouter();
    }
}
