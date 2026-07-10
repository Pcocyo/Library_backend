import { IProfileEntity } from "../../types";
import { ProfileStatus } from "../../types";

export class GetProfileResponseDto {
    private readonly profileDt: {
        user_id: string;
        user_name: string | null;
        first_name: string | null;
        last_name: string | null;
        contact: string | null;
        address: string | null;
        membership_date: Date | null;
        status: ProfileStatus;
        total_fines: number;
        updated_at: Date | null;
    };
    private constructor(profile: IProfileEntity) {
        this.profileDt = {
            user_id: profile.get_user_id(),
            user_name: profile.get_user_name(),
            first_name: profile.get_first_name(),
            last_name: profile.get_last_name(),
            contact: profile.get_contact(),
            address: profile.get_address(),
            membership_date: profile.get_membership_date(),
            status: profile.get_status(),
            total_fines: profile.get_total_fines(),
            updated_at: profile.get_updated_at(),
        };
    }
    public static extract(profile: IProfileEntity): GetProfileResponseDto {
        return new GetProfileResponseDto(profile);
    }
    public toResponse() {
        return this.profileDt;
    }
}

export class GetUpdateUserProfileResponseDto {
    private readonly profileDt: {
        user_id: string;
        user_name: string | null;
        first_name: string | null;
        last_name: string | null;
        contact: string | null;
        address: string | null;
        membership_date: Date | null;
        status: ProfileStatus;
        total_fines: number;
        updated_at: Date | null;
    };
    private constructor(profile: IProfileEntity) {
        this.profileDt = {
            user_id: profile.get_user_id(),
            user_name: profile.get_user_name(),
            first_name: profile.get_first_name(),
            last_name: profile.get_last_name(),
            contact: profile.get_contact(),
            address: profile.get_address(),
            membership_date: profile.get_membership_date(),
            status: profile.get_status(),
            total_fines: profile.get_total_fines(),
            updated_at: profile.get_updated_at(),
        };
    }
    public static extract(profile: IProfileEntity): GetUpdateUserProfileResponseDto {
        return new GetUpdateUserProfileResponseDto(profile);
    }
    public toResponse() {
        return this.profileDt;
    }
}

export class LibrarianUpdateUserProfileResponse {
    private readonly profileDt: {
        status: ProfileStatus;
        total_fines: number;
    };
    private constructor(profile:IProfileEntity){
      this.profileDt = {
            status: profile.get_status(),
            total_fines: profile.get_total_fines(),
      }
    }
    public static extract(profile:IProfileEntity):LibrarianUpdateUserProfileResponse{
      return new LibrarianUpdateUserProfileResponse(profile);
   }
    public toResponse(){
      return this.profileDt;
   }
}






