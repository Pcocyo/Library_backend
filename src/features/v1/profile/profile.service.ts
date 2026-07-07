import { IProfileEntity, IProfileRepository, IProfileService } from "./types";
import { GetProfileDto, LibrarianUpdateProfileDto, ProfileUpdateDto } from "./dto";
import { IUserEntity, IUserRepository } from "../user/types";

export class ProfileService implements IProfileService {
    private readonly profileRepository: IProfileRepository;
    private readonly userRepository: IUserRepository;

    public constructor(constructor: { profileRepository: IProfileRepository; userRepository: IUserRepository }) {
        this.profileRepository = constructor.profileRepository;
        this.userRepository = constructor.userRepository;
    }

    public async findById(dto: GetProfileDto): Promise<IProfileEntity> {
        let profileEntity: IProfileEntity = await this.profileRepository.findById({ user_id: dto.token.id });
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

    public async administrativeUpdate(dto: LibrarianUpdateProfileDto): Promise<IProfileEntity> {
        let user: IUserEntity = await this.userRepository.getByEmail({
            email: dto.data.email,
        });
        
        let updateUserProfile: IProfileEntity = await this.profileRepository.save({
            user_id: user.getId(),
            total_fines: dto.data.total_fines,
            status: dto.data.status ?? undefined,
        });
        return updateUserProfile;
    }
}
