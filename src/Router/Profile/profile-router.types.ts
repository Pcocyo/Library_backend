import { Request } from "express";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { ProfileStatus } from "../../Controller/Profile/Profile.interface";

export interface ProfileUpdateRequest extends Request {
    body: {
        user_name: string | null;
        first_name: string | null;
        last_name: string | null;
        contact: string | null;
        address: string | null;
        authorizedUser: UserJwtPayloadInterface;
    };
}

export interface ProfileSubscribeRequest extends Request {
    body: {
        authorizedUser: UserJwtPayloadInterface;
    };
}

export interface LibrarianUpdateUserProfileRequest extends Request {
    body: {
        total_fines: number | null;
        status: ProfileStatus | null;
        email: string;
        authorizedUser: UserJwtPayloadInterface;
    };
}
