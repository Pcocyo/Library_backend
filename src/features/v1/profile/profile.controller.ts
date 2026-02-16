import { Request, Response, NextFunction } from "express";
import { IProfileController } from "./types";
import {
    GetProfileDto,
    ProfileUpdateDto,
    LibrarianUpdateProfileDto,
    SubscribeDto,
} from "./dto";
import { ProfileService } from "./profile.service";
import { UserService } from "../user";
import { ClientErrorFactory } from "../../../core/error/exceptions";

export class ProfileController implements IProfileController {
    public async getProfile(req: Request, res: Response, next: NextFunction) {
        const payload: GetProfileDto = GetProfileDto.fromRequest(req);
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

    public async updateUserProfile(
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
            
            const profileUpdateConfig: Record<string,
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
                    const userInput =
                        payload.data[field as keyof typeof payload.data];
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

    public async librarianUpdateUserProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const payload: LibrarianUpdateProfileDto =
            LibrarianUpdateProfileDto.fromRequest(req);
        const userToUpdate: UserService = await UserService.getUserByEmail({
            email: payload.data.email,
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

    public async subscribe(req: Request, res: Response, next: NextFunction) {
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
            user.setRole("MEMBER");
            profile.set_memberDate(new Date());
            res.status(200).send({
                message: `User ${payload.token.email} successfully subscribed`,
            });
        } catch (error: any) {
            next(error);
        }
    }
}
