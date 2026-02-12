import { BaseRouter } from "../../../core/base/base.router";
import { NextFunction, Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { UserService } from "../../v1/user/user.service";
import { UserRole } from "../../v1/user/types/user-service.types";
import { UserUpdateProfileParam } from "./types/profile-service.types";
import {
    LibrarianUpdateUserProfileRequest,
    ProfileUpdateRequest,
} from "./types/profile-router.types";

import {
    LibrarianUpdateProfileRequestSchema,
    ProfileUpdateRequestSchema,
} from "./profile.schema";
import { ClientErrorFactory } from "../../../core/error/exceptions";
import { validate } from "../../../core/middleware/validation-handler/validation-handler.middleware";
import { IAuthMiddleware } from "../../../core/middleware/types";

export class ProfileRouter extends BaseRouter {
    private readonly authMiddleware: IAuthMiddleware;
    public constructor(authMiddleware: IAuthMiddleware) {
        super();
        this.authMiddleware = authMiddleware;
        this.initializeRoutes();
    }

    protected initializeRoutes() {
        this.router.get(
            "/get",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            (req: Request, res: Response, next: NextFunction) => {
                this.getProfile(req, res, next);
            },
        );

        this.router.patch(
            "/update",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            validate(ProfileUpdateRequestSchema),
            (req: ProfileUpdateRequest, res: Response, next: NextFunction) => {
                this.updateUserProfile(req, res, next);
            },
        );

        this.router.patch(
            "/subscribe",
            this.authMiddleware.CreateValidateTokenMiddleware(undefined),
            (req: Request, res: Response, next: NextFunction) => {
                this.subscribe(req, res, next);
            },
        );

        this.router.patch(
            "/librarian/update",
            this.authMiddleware.CreateValidateTokenMiddleware({
                option: { required_role: UserRole.LIBRARIAN },
            }),
            validate(LibrarianUpdateProfileRequestSchema),
            (req: Request, res: Response, next: NextFunction) => {
                this.librarianUpdateUserProfile(req, res, next);
            },
        );
    }

    private async getProfile(req: Request, res: Response, next: NextFunction) {
        const userData = req.body.authorizedUser;
        try {
            const userProfile: ProfileService =
                await ProfileService.GetByUserId({
                    user_id: userData.userId,
                });
            res.send({
                user_id: userData.id,
                user_name: userProfile.get_userName(),
                first_name: userProfile.get_firstName(),
                last_name: userProfile.get_lastName(),
                contact: userProfile.get_contact(),
                address: userProfile.get_address(),
                membership_date: userProfile.get_memberDate(),
                status: userProfile.get_status(),
                total_fines: userProfile.get_totalFines(),
                updated_at: userProfile.get_updatedAt(),
            });
        } catch (error: any) {
            next(error);
        }
    }

    private async updateUserProfile(
        req: ProfileUpdateRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userProfile: ProfileService =
                await ProfileService.GetByUserId({
                    user_id: req.body.authorizedUser.id,
                });

            const profileUpdateConfig: Record<
                keyof UserUpdateProfileParam,
                {
                    getter: (p: ProfileService) => string | null;
                    setter: (p: ProfileService, value: string | null) => void;
                }
            > = {
                user_name: {
                    getter: (p) => {
                        return p.get_userName();
                    },
                    setter: (p, value) => p.set_userName(value),
                },
                first_name: {
                    getter: (p) => {
                        return p.get_firstName();
                    },
                    setter: (p, value) => p.set_firstName(value),
                },
                last_name: {
                    getter: (p) => {
                        return p.get_lastName();
                    },
                    setter: (p, value) => p.set_lastName(value),
                },
                contact: {
                    getter: (p) => {
                        return p.get_contact();
                    },
                    setter: (p, value) => p.set_contact(value),
                },
                address: {
                    getter: (p) => {
                        return p.get_address();
                    },
                    setter: (p, value) => p.set_address(value),
                },
            };

            let hasChanges: boolean = false;

            for (const [field, config] of Object.entries(profileUpdateConfig)) {
                if (field in req.body) {
                    const userInput = req.body[field as keyof typeof req.body];
                    const currentVal = config.getter(userProfile);
                    if (currentVal != userInput) {
                        hasChanges = true;
                        config.setter(userProfile, userInput as string | null);
                    }
                }
            }

            if (hasChanges) {
                userProfile.set_updatedAt(new Date());
            }

            res.status(200).json({ message: `Update success` });
        } catch (error: any) {
            next(error);
        }
    }

    private async librarianUpdateUserProfile(
        req: LibrarianUpdateUserProfileRequest,
        res: Response,
        next: NextFunction,
    ) {
        const userToUpdate: UserService = await UserService.getUserByEmail({
            email: req.body.email,
        });
        const userProfile: ProfileService = await ProfileService.GetByUserId({
            user_id: userToUpdate.getId(),
        });
        try {
            userProfile.set_fines(req.body.total_fines);
            userProfile.set_status(req.body.status);
            res.status(200).json({ message: "success" });
        } catch (error: any) {
            next(error);
        }
    }

    private async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.authorizedUser.role !== "GUEST")
                throw ClientErrorFactory.createInvalidClientRequestError({
                    context: req.body,
                    message: "User status is not a guest",
                });
            const userData = req.body.authorizedUser;
            const user: UserService = await UserService.getUserByEmail({
                email: userData.email,
            });
            const profile: ProfileService = await ProfileService.GetByUserId({
                user_id: userData.id,
            });
            user.setRole(UserRole.MEMBER);
            profile.set_memberDate(new Date());
            res.status(200).send({
                message: `User ${userData.userEmail} successfully subscribed`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
