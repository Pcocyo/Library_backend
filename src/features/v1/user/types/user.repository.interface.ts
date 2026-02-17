import { IUserEntity } from "./user.entity.interface"
import { CreateUserDto,DeleteUserDto,GetUserDto, LoginUserDto, UpdateUserDto } from "../dto";
export interface IUserRepository{
   createNewUser(dto:CreateUserDto):Promise<IUserEntity>;
   getUserByEmail(dto:GetUserDto | LoginUserDto):Promise<IUserEntity>;
   deleteUser(dto:DeleteUserDto):Promise<void>;
   updateUser(dto:UpdateUserDto):Promise<IUserEntity>;
}
