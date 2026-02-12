import { IAuthMiddleware, IValidationMiddleware } from "../core/middleware/types";
import { ProfileRouter } from "./v1/profile/";

export class ProfileModule {
    private readonly profileRouter: ProfileRouter;
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
     
    constructor(authMiddleware: IAuthMiddleware,validationMiddleware: IValidationMiddleware) {
        this.authMiddleware = authMiddleware;
        this.validationMiddleware = validationMiddleware;
        this.profileRouter = new ProfileRouter(this.authMiddleware,this.validationMiddleware);
    }

    public getRouter() {
        return this.profileRouter.getRouter();
    }
}
