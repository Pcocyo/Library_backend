import { UserRole } from "./user.entity.types"

export interface UserRegisterInterface {
    email:string,
    password: string,
    role: UserRole | null
};

export interface UserDomainInterface{
    id:string,
    email:string,
    password:string,
    role:UserRole,
    created_at: Date,
}

export interface UserGetEmailInterface{
    email:string,
}

export interface UserDeleteInterface{
    id:string,
    email:string,
}
