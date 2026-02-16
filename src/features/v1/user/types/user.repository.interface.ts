import { IUserEntity } from "./user.entity.interface"
import { CreateUserDto,DeleteUserDto,GetUserDto, UpdateUserDto } from "../dto";
export interface IUserRepository{
   createNewUser(dto:CreateUserDto):Promise<IUserEntity>;
   getUserByEmail(dto:GetUserDto):Promise<IUserEntity>;
   deleteUser(dto:DeleteUserDto):Promise<void>;
   updateUser(dto:UpdateUserDto):Promise<IUserEntity>;
}
