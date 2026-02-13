export enum ProfileStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED",
}

export interface ProfileParam {
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
}

export interface CreateProfileParam {
    user_id: string;
    user_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    contact?: string | null;
    address?: string | null;
    membership_date?: Date | null;
    updated_at?: Date | null;
}

export interface UserUpdateProfileParam {
    user_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    contact?: string | null;
    address?: string | null;
}

export interface LibrarianUpdateProfileParam {
    email: string;
    total_fines: number | null | undefined;
    status: string | null | undefined;
}

export interface GetByUserIdParam {
    user_id: string;
}
