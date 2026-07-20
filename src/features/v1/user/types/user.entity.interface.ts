import { UserRole } from "./user.entity.types";

export interface IUserEntityConstructor{
    user_id:string,
    email:string,
    password:string,
    role:string,
    created_at: Date,
    updated_at:Date
}

export interface IUserEntity{
     getEmail(): string ;
     getId(): string;
     getPassword(): string;
     getRole():UserRole;
     getCreatedAt(): Date;
     getUpdatedAt():Date;
}
