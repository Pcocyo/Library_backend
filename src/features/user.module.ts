import { UserRepository, UserRouter, UserService } from "./v1/user/";
import { IAuthMiddleware, IValidationMiddleware } from "../core/middleware/types";
import { IBcryptService, IJwtService } from "../core/security/interfaces";
import { IUserController, IUserRepository, IUserService } from "./v1/user/types";
import { UserController } from "./v1/user/user.controller";
import { IProfileRepository } from "./v1/profile/types";

export interface IUserModule {
    authMiddleware: IAuthMiddleware;
    validationMiddleware: IValidationMiddleware;
    jwtService: IJwtService;
    bcryptService: IBcryptService;
    profileRepository: IProfileRepository;
    userRepository: IUserRepository;
}

export default class UserModule {
    private readonly userRouter: UserRouter;

    //middleware used
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;

    //service used
    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;
    private readonly userController: IUserController;
    private readonly userService: IUserService;
    //repsository used
    private readonly userRepository: IUserRepository;
    private readonly ProfileRepository: IProfileRepository;

    constructor(constructor:IUserModule) {
        this.jwtService = constructor.jwtService;
        this.authMiddleware = constructor.authMiddleware;
        this.bcryptService = constructor.bcryptService;
        this.validationMiddleware = constructor.validationMiddleware;
        this.userRepository = constructor.userRepository;
        this.ProfileRepository = constructor.profileRepository;

        this.userService = new UserService({
            userRepository: this.userRepository,
            jwtService: this.jwtService,
            bcryptService: this.bcryptService,
            profileRepository: this.ProfileRepository,
        });

        this.userController = new UserController(this.userService);
        this.userRouter = new UserRouter(this.authMiddleware, this.validationMiddleware, this.userController);
    }

    public getRouter() {
        return this.userRouter.getRouter();
    }
}
