import { IProfileEntity, IProfileRepository, IProfileService } from "./types";
import {
    GetProfileDto,
    LibrarianUpdateProfileDto,
    ProfileUpdateDto,
} from "./dto";
import { IUserEntity, IUserRepository } from "../user/types";

export class ProfileService implements IProfileService {
    private readonly profileRepository: IProfileRepository;
    private readonly userRepository: IUserRepository;

    public constructor(
        profileRepository: IProfileRepository,
        userRepository: IUserRepository,
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public async getById(dto: GetProfileDto): Promise<IProfileEntity> {
        let profileEntity: IProfileEntity =
            await this.profileRepository.findById({ user_id: dto.token.id });
        return profileEntity;
    }

    public async updateSelf(dto: ProfileUpdateDto): Promise<IProfileEntity> {
        let profileEntity: IProfileEntity = await this.profileRepository.save({
            user_id: dto.token.id,
            address: dto.data.address,
            contact: dto.data.contact,
            user_name: dto.data.user_name,
            last_name: dto.data.last_name,
            first_name: dto.data.first_name,
        });
        return profileEntity;
    }

    public async administrativeUpdate(dto: LibrarianUpdateProfileDto) {
        //let userEntityToUpdate:IUserEntity = this.userRepository.getUserByEmail()
        let profileEntity: IProfileEntity = await this.profileRepository.save(
        );
    }
    public activateMembership() {}
}
