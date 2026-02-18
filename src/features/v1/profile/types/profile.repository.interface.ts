import { IProfileEntity } from ".";
import { ProfileRepoSaveDto,ProfileRepoFindByIdDto,ProfileRepoDeleteDto } from ".";


export interface IProfileRepository {
    save(parameter: ProfileRepoSaveDto): Promise<IProfileEntity>;
    findById(parameter:ProfileRepoFindByIdDto):Promise<IProfileEntity>;
    delete(parameter:ProfileRepoDeleteDto):Promise<void>;
}
