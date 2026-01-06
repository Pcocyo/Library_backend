//table.string("user_name", 20); //represent user custom username
//table.string("first_name", 20); // represent user first name
//table.string("last_name", 20); // represent user last name
//table.string("contact", 17); // represent user contact number
//table.text("address"); // represnt user home address
//table.timestamp("membership_date"); // represent user membership date (if null, not a member)
//table.string("status",10).notNullable().defaultTo("ACTIVE"); // represent user status, (active, suspended, banned)
//table.decimal("total_fines",10,2).notNullable().defaultTo(0.00); // user total fines in usd
//table.timestamp("updated_at"); // represent user data last profile updates

export enum ProfileStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED",
}

export interface ProfileParam {
    user_id : string;
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

export interface CreateProfileParam{
    user_id:string;
    user_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    contact?: string | null;
    address?: string | null;
    membership_date?: Date | null;
    updated_at?: Date | null;
}

export interface UserUpdateProfileParam{
    user_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    contact?: string | null;
    address?: string | null;
}

export interface LibrarianUpdateProfileParam{
    email:string;
    total_fines: number| null| undefined;
    status: string | null| undefined;
}

export interface GetByUserIdParam{
   user_id:string;
}
