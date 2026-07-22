import { UserRole } from "./user.entity.types";

export type UserRepoCreateDto = {
    email: string;
    password: string;
};

export type UserRepoGetByEmailDto = {
    email: string;
};

export type UserRepoDeleteDto = {
    email: string;
    user_id: string;
};

export type UserRepoUpdateDto = {
    user_id: string;
    email?: string;
    password?: string;
    role?: UserRole;
};

export type UserRepoSaveDto = {
   email:string;
   password?:string | null;
   role?:UserRole | null;
   updatedAt?:Date | null;
}
