import { IUserEntity } from "./user.entity.interface"
import { UserRepoCreateDto, UserRepoDeleteDto, UserRepoGetByEmailDto, UserRepoUpdateDto,UserRepoSaveDto } from "./user.repository.types";
export interface IUserRepository{
   create(parameter:UserRepoCreateDto):Promise<IUserEntity>;
   getByEmail(parameter:UserRepoGetByEmailDto):Promise<IUserEntity>;
   delete(parameter:UserRepoDeleteDto):Promise<void>;
   update(parameter:UserRepoUpdateDto):Promise<IUserEntity>;
   save(parameter:UserRepoSaveDto):Promise<void>;
}
