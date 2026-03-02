import { IProfileEntity, IProfileRepository, IProfileService } from "./types";
import { GetProfileDto, LibrarianUpdateProfileDto, ProfileUpdateDto } from "./dto";

import { IUserEntity, IUserRepository } from "../user/types";

export class ProfileService implements IProfileService {
    private readonly profileRepository: IProfileRepository;
    private readonly userRepository: IUserRepository;

    public constructor(param: { profileRepository: IProfileRepository; userRepository: IUserRepository }) {
        this.profileRepository = param.profileRepository;
        this.userRepository = param.userRepository;
    }

    public async findById(dto: GetProfileDto): Promise<IProfileEntity> {
        let profileEntity: IProfileEntity = await this.profileRepository.findById({ user_id: dto.token.id });
        return profileEntity;
    }

    public async updateSelf(dto: ProfileUpdateDto): Promise<IProfileEntity> {
        let profileEntity: IProfileEntity = await this.profileRepository.save({
            user_id: dto.token.id,
            address: dto.data.address ?? undefined,
            contact: dto.data.contact ?? undefined,
            user_name: dto.data.user_name ?? undefined,
            last_name: dto.data.last_name ?? undefined,
            first_name: dto.data.first_name ?? undefined,
        });
        return profileEntity;
    }

    public async administrativeUpdate(dto: LibrarianUpdateProfileDto): Promise<IProfileEntity> {
        let user: IUserEntity = await this.userRepository.getByEmail({
            email: dto.data.email,
        });

        let updateUserProfile: IProfileEntity = await this.profileRepository.save({
            user_id: user.getId(),
            total_fines: dto.data.total_fines ?? undefined,
            status: dto.data.status ?? undefined,
        });
        return updateUserProfile;
    }
}
