import { IAuthMiddleware, IValidationMiddleware } from "../core/middleware/types";
import { ProfileRouter } from "./v1/profile/";
import { ProfileController } from "./v1/profile/profile.controller";
import { IProfileController } from "./v1/profile/types";

export class ProfileModule {
    private readonly profileRouter: ProfileRouter;
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
    private readonly profileController: IProfileController;
    
     
    constructor(authMiddleware: IAuthMiddleware,validationMiddleware: IValidationMiddleware) {
        this.authMiddleware = authMiddleware;
        this.validationMiddleware = validationMiddleware;
        this.profileController = new ProfileController();
        this.profileRouter = new ProfileRouter(this.authMiddleware,this.validationMiddleware,this.profileController);
    }

    public getRouter() {
        return this.profileRouter.getRouter();
    }
}
