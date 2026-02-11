import { UserRouter } from "./v1/user/";
import { IAuthMiddleware } from "../core/middleware/types";
import { IBcryptService, IJwtService } from "../core/security/interfaces";
import BcryptService from "../core/security/bcrypt.service";

export default class UserModule {
    private userRouter: UserRouter;
    private authMiddleware: IAuthMiddleware;
    private jwtService: IJwtService;
    private bcryptService: IBcryptService;
    constructor(
        authMiddleware: IAuthMiddleware,
        jwtService: IJwtService,
        bcryptService: IBcryptService,
    ) {
        this.jwtService = jwtService;
        this.authMiddleware = authMiddleware;
        this.bcryptService = bcryptService;

        this.userRouter = new UserRouter({
            authMiddleware: this.authMiddleware,
            jwtService: this.jwtService,
            bcryptService: this.bcryptService,
        });
    }

    public getRouter() {
        return this.userRouter.getRouter();
    }
}
