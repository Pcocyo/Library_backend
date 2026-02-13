import { UserRouter } from "./v1/user/";
import {
    IAuthMiddleware,
    IValidationMiddleware,
} from "../core/middleware/types";
import { IBcryptService, IJwtService } from "../core/security/interfaces";
import { IUserController } from "./v1/user/types";
import { UserController } from "./v1/user/user.controller";

export default class UserModule {
    private readonly userRouter: UserRouter;

    //middleware used
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;

    //service used
    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;
    private readonly userController: IUserController;
    constructor(
        authMiddleware: IAuthMiddleware,
        validationMiddleware: IValidationMiddleware,
        jwtService: IJwtService,
        bcryptService: IBcryptService,
    ) {
        this.jwtService = jwtService;
        this.authMiddleware = authMiddleware;
        this.bcryptService = bcryptService;
        this.validationMiddleware = validationMiddleware;

        this.userController = new UserController(
            this.bcryptService,
            this.jwtService,
        );

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
