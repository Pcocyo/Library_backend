import { IAuthMiddleware } from "../core/middleware/types";
import { ProfileRouter } from "./v1/profile/";

export class ProfileModule {
    private profileRouter: ProfileRouter;
    private authMiddleware: IAuthMiddleware;
    constructor(authMiddleware: IAuthMiddleware) {
        this.authMiddleware = authMiddleware;
        this.profileRouter = new ProfileRouter(this.authMiddleware);
    }

    public getRouter() {
        return this.profileRouter.getRouter();
    }
}
