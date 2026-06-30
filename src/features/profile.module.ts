import { IAuthMiddleware, IValidationMiddleware } from "../core/middleware/types";
import { ProfileRouter, ProfileService } from "./v1/profile/";
import { ProfileController } from "./v1/profile/profile.controller";
import { IProfileController, IProfileRepository, IProfileService } from "./v1/profile/types";
import { IUserRepository } from "./v1/user/types";

export interface IProfileModule {
    authMiddleware: IAuthMiddleware;
    validationMiddleware: IValidationMiddleware;
    profileRepository: IProfileRepository;
    userRepository: IUserRepository;
}
export class ProfileModule {
    private readonly profileRouter: ProfileRouter;
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
    private readonly profileController: IProfileController;
    private readonly profileRepository: IProfileRepository;
    private readonly userRepository: IUserRepository;
    private readonly profileService: IProfileService;

    constructor(constructor: IProfileModule) {
        this.authMiddleware = constructor.authMiddleware;
        this.validationMiddleware = constructor.validationMiddleware;
        this.profileRepository = constructor.profileRepository;
        this.userRepository = constructor.userRepository;

        this.profileService = new ProfileService({
            userRepository: this.userRepository,
            profileRepository: this.profileRepository,
        });

        this.profileController = new ProfileController(this.profileService);
        this.profileRouter = new ProfileRouter(this.authMiddleware, this.validationMiddleware, this.profileController);
    }

    public getRouter() {
        return this.profileRouter.getRouter();
    }
}
