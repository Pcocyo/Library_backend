import { BaseRouter } from "../../../core/base/base.router";
import { NextFunction, Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { UserService } from "../../v1/user/user.service";
import { UserRole } from "../../v1/user/types/user-service.types";
import { UserUpdateProfileParam } from "./types/profile-service.types";
import {
    LibrarianUpdateProfileRequestSchema,
    ProfileUpdateRequestSchema,
} from "./profile.schema";
import { ClientErrorFactory } from "../../../core/error/exceptions";
import { validate } from "../../../core/middleware/validation-handler/validation-handler.middleware";
import { IAuthMiddleware } from "../../../core/middleware/types";
import { GetProfileDto,ProfileUpdateDto,LibrarianUpdateProfileDto,SubscribeDto } from "./dto";

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
            (req: Request, res: Response, next: NextFunction) => {
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
        const payload:GetProfileDto = GetProfileDto.fromRequest(req);
        try {
            const userProfile: ProfileService =
                await ProfileService.GetByUserId({
                    user_id: payload.token.id,
                });
            res.send({
                user_id: userProfile.get_userId(),
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
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const payload: ProfileUpdateDto = ProfileUpdateDto.fromRequest(req);

            const userProfile: ProfileService =
                await ProfileService.GetByUserId({
                    user_id: payload.token.id,
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
                if (field in payload.data) {
                    console.log(field);
                    const userInput = payload.data[field as keyof typeof payload.data];
                    console.log(userInput);
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
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const payload: LibrarianUpdateProfileDto = LibrarianUpdateProfileDto.fromRequest(req);
        const userToUpdate: UserService = await UserService.getUserByEmail({
            email: payload.data.email
        });
        const userProfile: ProfileService = await ProfileService.GetByUserId({
            user_id: userToUpdate.getId(),
        });
        try {
            userProfile.set_fines(payload.data.total_fines);
            userProfile.set_status(payload.data.status);
            res.status(200).json({ message: "success" });
        } catch (error: any) {
            next(error);
        }
    }

    private async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: SubscribeDto = SubscribeDto.fromRequest(req);
            if (payload.token.role !== "GUEST")
                throw ClientErrorFactory.createInvalidClientRequestError({
                    context: payload,
                    message: "User status is not a guest",
                });
            const user: UserService = await UserService.getUserByEmail({
                email: payload.token.email,
            });
            const profile: ProfileService = await ProfileService.GetByUserId({
                user_id: payload.token.id,
            });
            user.setRole(UserRole.MEMBER);
            profile.set_memberDate(new Date());
            res.status(200).send({
                message: `User ${payload.token.email} successfully subscribed`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
