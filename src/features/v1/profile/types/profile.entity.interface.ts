import {ProfileStatus} from "./profile.entity.types";

export interface IProfileEntityConstructor {
    user_name: string | null;
    first_name: string | null;
    last_name: string | null;
    contact: string | null;
    address: string | null;
    membership_date: Date | null;
    status: ProfileStatus;
    total_fines: number;
    updated_at: Date | null;
}

export interface IProfileEntity{
     get_user_name(): string | null; 
     get_first_name(): string | null; 
     get_last_name(): string | null; 
     get_contact(): string | null; 
     get_address(): string | null; 
     get_membership_date(): Date | null; 
     get_status(): ProfileStatus; 
     get_total_fines(): number; 
     get_updated_at(): Date | null; 
}
