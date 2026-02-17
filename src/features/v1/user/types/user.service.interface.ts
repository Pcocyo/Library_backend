import { IBcryptService, IJwtService } from "../../../../core/security/interfaces";
import {
    UpdateUserDto,
    DeleteUserDto,
    GetUserDto,
    CreateUserDto,
    LoginUserDto,
} from "../dto";
import { IUserEntity } from "./user.entity.interface";
import { IUserRepository } from "./user.repository.interface";

export interface IUserService {
    update(dto: UpdateUserDto): Promise<string>;
    create(dto: CreateUserDto): Promise<string>;
    delete(dto: DeleteUserDto): Promise<void>;
    findUser(dto: GetUserDto): Promise<IUserEntity>;
    compare(dto:LoginUserDto): Promise<string>;
}

export interface IUserServiceConstructor{
   jwtService:IJwtService,
   bcryptService:IBcryptService,
   userRepository:IUserRepository
}
