import {
    GetProfileDto,
    ProfileUpdateDto,
    LibrarianUpdateProfileDto,
} from "../dto";
import { IProfileEntity } from "./profile.entity.interface";

export interface IProfileService {
    findById(dto: GetProfileDto): Promise<IProfileEntity>;
    updateSelf(dto: ProfileUpdateDto): Promise<IProfileEntity>;
    administrativeUpdate(
        dto: LibrarianUpdateProfileDto,
    ): Promise<IProfileEntity>;
}
