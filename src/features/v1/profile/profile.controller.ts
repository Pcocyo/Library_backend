import { GetUpdateUserProfileResponseDto,GetProfileResponseDto, GetProfileDto, ProfileUpdateDto, LibrarianUpdateProfileDto, SubscribeDto } from "./dto";
import { Request, Response, NextFunction } from "express";
import { IProfileController, IProfileEntity } from "./types";
import { IProfileService } from "./types";
import { LibrarianUpdateUserProfileResponse } from "./dto/response/profile.response.dto";

export class ProfileController implements IProfileController {
    private readonly profileService: IProfileService;
    public constructor(profileService: IProfileService) {
        this.profileService = profileService;
        this.updateUserProfile = this.updateUserProfile.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.librarianUpdateUserProfile = this.librarianUpdateUserProfile.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }

    public async getProfile(req: Request, res: Response, next: NextFunction) {
        const payload: GetProfileDto = GetProfileDto.fromRequest(req);
        try {
            const userProfile: IProfileEntity = await this.profileService.findById(payload);
            res.status(200).send(GetProfileResponseDto.extract(userProfile).toResponse());
        } catch (error: any) {
            next(error);
        }
    }

    public async updateUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const payload: ProfileUpdateDto = ProfileUpdateDto.fromRequest(req);

            const userProfile: IProfileEntity = await this.profileService.updateSelf(payload);

            res.status(200).send(GetUpdateUserProfileResponseDto.extract(userProfile).toResponse());
        } catch (error: any) {
            next(error);
        }
    }

    public async librarianUpdateUserProfile(req: Request, res: Response, next: NextFunction) {
        const payload: LibrarianUpdateProfileDto = LibrarianUpdateProfileDto.fromRequest(req);
        const userProfile: IProfileEntity = await this.profileService.administrativeUpdate(payload);
        try {
            res.status(200).json({ message: "success", ...LibrarianUpdateUserProfileResponse.extract(userProfile).toResponse()});
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
