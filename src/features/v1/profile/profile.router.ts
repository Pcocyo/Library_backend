import { BaseRouter } from "../../../core/base/base.router";
import { NextFunction, Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { UserService } from "../../v1/user/user.service";
import { UserRole } from "../../v1/user/types/user-service.types";
import {
    LibrarianUpdateProfileRequestSchema,
    ProfileUpdateRequestSchema,
} from "./profile.schema";
import { ClientErrorFactory } from "../../../core/error/exceptions";
import {
    IAuthMiddleware,
    IValidationMiddleware,
} from "../../../core/middleware/types";
import {
    GetProfileDto,
    ProfileUpdateDto,
    LibrarianUpdateProfileDto,
    SubscribeDto,
} from "./dto";
import { IProfileController } from "./types";
export class ProfileRouter extends BaseRouter {
    private readonly authMiddleware: IAuthMiddleware;
    private readonly validationMiddleware: IValidationMiddleware;
    private readonly profileController: IProfileController;

    public constructor(
        authMiddleware: IAuthMiddleware,
        validationMiddleware: IValidationMiddleware,
        profileController:IProfileController
    ) {
        super();
        this.authMiddleware = authMiddleware;
        this.validationMiddleware = validationMiddleware;
        this.profileController = profileController;
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.get(
            "/get",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.profileController.getProfile
        );

        this.router.patch(
            "/update",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.validationMiddleware.validate(ProfileUpdateRequestSchema),
            this.profileController.updateUserProfile
        );

        this.router.patch(
            "/subscribe",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            this.profileController.subscribe
        );

        this.router.patch(
            "/librarian/update",
            this.authMiddleware.CreateValidateTokenMiddleware({
                option: { required_role: UserRole.LIBRARIAN },
            }),
            this.validationMiddleware.validate(LibrarianUpdateProfileRequestSchema),
            this.profileController.librarianUpdateUserProfile
        );
    }
}
