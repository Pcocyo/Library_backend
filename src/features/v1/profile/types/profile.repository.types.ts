import { ProfileStatus } from ".";

export type ProfileRepoFindByIdDto = {
   user_id:string;
}

export type ProfileRepoDeleteDto = {
   user_id:string;
}

export type ProfileRepoSaveDto = {
    user_id: string;
    user_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    contact?: string | null;
    address?: string | null;
    membership_date?: Date | null;
    status?: ProfileStatus;
    total_fines?: number;
    updated_at?: Date | null;
}
