import { UserRouter } from "./v1/user/";
import { IAuthMiddleware,IValidationMiddleware } from "../core/middleware/types";
import { IBcryptService, IJwtService } from "../core/security/interfaces";
 
export default class UserModule {
    private readonly userRouter: UserRouter;
    
    //middleware used
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
      
    //service used
    private readonly jwtService: IJwtService;
    private readonly bcryptService: IBcryptService;
    constructor(
        authMiddleware: IAuthMiddleware,
        validationMiddleware:IValidationMiddleware,
        jwtService: IJwtService,
        bcryptService: IBcryptService,
    ) {
        this.jwtService = jwtService;
        this.authMiddleware = authMiddleware;
        this.bcryptService = bcryptService;
        this.validationMiddleware = validationMiddleware;

        this.userRouter = new UserRouter({
            authMiddleware: this.authMiddleware,
            validationMiddleware: this.validationMiddleware,
            jwtService: this.jwtService,
            bcryptService: this.bcryptService,
        });
    }

    public getRouter() {
        return this.userRouter.getRouter();
    }
}
