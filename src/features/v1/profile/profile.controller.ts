import { Request, Response, NextFunction } from "express";
import { IProfileController, IProfileEntity } from "./types";
import { GetProfileDto, ProfileUpdateDto, LibrarianUpdateProfileDto, SubscribeDto } from "./dto";
import { IProfileService } from "./types";
import { ProfileService } from "./profile.service";
import { UserService } from "../user";
import { ClientErrorFactory } from "../../../core/error/exceptions";

export class ProfileController implements IProfileController {
    private readonly profileService: IProfileService;
    public constructor(profileService: IProfileService) {
        this.profileService = profileService;
        this.updateUserProfile.bind(this);
        this.getProfile.bind(this);
        this.librarianUpdateUserProfile.bind(this);
        this.subscribe.bind(this);
    }

    public async getProfile(req: Request, res: Response, next: NextFunction) {
        const payload: GetProfileDto = GetProfileDto.fromRequest(req);
        try {
            const userProfile: IProfileEntity = await this.profileService.findById(payload);
            res.status(200).send({
                user_id: userProfile.get_user_id(),
                user_name: userProfile.get_user_name(),
                first_name: userProfile.get_first_name(),
                last_name: userProfile.get_last_name(),
                contact: userProfile.get_contact(),
                address: userProfile.get_address(),
                membership_date: userProfile.get_membership_date(),
                status: userProfile.get_status(),
                total_fines: userProfile.get_total_fines(),
                updated_at: userProfile.get_updated_at(),
            });
        } catch (error: any) {
            next(error);
        }
    }

    public async updateUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: ProfileUpdateDto = ProfileUpdateDto.fromRequest(req);

            const userProfile: IProfileEntity = await this.profileService.updateSelf(payload);

            res.status(200).send({
                user_id: userProfile.get_user_id(),
                user_name: userProfile.get_user_name(),
                first_name: userProfile.get_first_name(),
                last_name: userProfile.get_last_name(),
                contact: userProfile.get_contact(),
                address: userProfile.get_address(),
                membership_date: userProfile.get_membership_date(),
                status: userProfile.get_status(),
                total_fines: userProfile.get_total_fines(),
                updated_at: userProfile.get_updated_at(),
            });
        } catch (error: any) {
            next(error);
        }
    }

    public async librarianUpdateUserProfile(req: Request, res: Response, next: NextFunction) {
        const payload: LibrarianUpdateProfileDto = LibrarianUpdateProfileDto.fromRequest(req);
        const userProfile: IProfileEntity = await this.profileService.administrativeUpdate(payload);
        try {
            res.status(200).json({ message: "success" });
        } catch (error: any) {
            next(error);
        }
    }

    public async subscribe(req: Request, res: Response, next: NextFunction) {
        try {
              res.send("holder");
//            const payload: SubscribeDto = SubscribeDto.fromRequest(req);
//            if (payload.token.role !== "GUEST")
//                throw ClientErrorFactory.createInvalidClientRequestError({
//                    context: payload,
//                    message: "User status is not a guest",
//                });
//            const user: UserService = await UserService.getUserByEmail({
//                email: payload.token.email,
//            });
//            const profile: ProfileService = await ProfileService.GetByUserId({
//                user_id: payload.token.id,
//            });
//            user.setRole("MEMBER");
//            profile.set_memberDate(new Date());
//            res.status(200).send({
//                message: `User ${payload.token.email} successfully subscribed`,
//           });
        } catch (error: any) {
            next(error);
        }
    }
}
