import { PrismaClient } from "@prisma/client";
import {
    IProfileEntity,
    IProfileRepository,
    ProfileRepoDeleteDto,
    ProfileRepoFindByIdDto,
    ProfileRepoSaveDto,
    ProfileStatus,
} from "./types";
import { ErrorMapperGroup } from "../../../core/error/mappers";
import { ProfileEntity } from "./profile.entity";

export class ProfileRepository implements IProfileRepository {
    private readonly prisma: PrismaClient;
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async save(parameter: ProfileRepoSaveDto): Promise<IProfileEntity> {
        try {
            let profile = await this.prisma.profiles.upsert({
                where: {
                    user_id: parameter.user_id,
                },
                update: {
                    user_name: parameter.user_name,
                    first_name: parameter.first_name,
                    last_name: parameter.last_name,
                    contact: parameter.contact,
                    address: parameter.address,
                    membership_date: parameter.membership_date,
                    status: parameter.status,
                    total_fines: parameter.total_fines,
                    updated_at: new Date(),
                },
                create: {
                    user_id: parameter.user_id,
                    user_name: parameter.user_name,
                    first_name: parameter.first_name,
                    last_name: parameter.last_name,
                    contact: parameter.contact,
                    address: parameter.address,
                    membership_date: parameter.membership_date,
                    status: parameter.status,
                    total_fines: parameter.total_fines,
                    updated_at: new Date(),
                },
            });

            return new ProfileEntity({
                user_name: profile.user_name,
                first_name: profile.first_name,
                last_name: profile.last_name,
                contact: profile.contact,
                address: profile.address,
                membership_date: profile.membership_date,
                status: profile.status as ProfileStatus,
                total_fines: profile.total_fines.toNumber(),
                updated_at: profile.updated_at,
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }
    async findById(parameter: ProfileRepoFindByIdDto): Promise<IProfileEntity> {
        try {
            let profile = await this.prisma.profiles.findUniqueOrThrow({
                where: { user_id: parameter.user_id },
            });
            return new ProfileEntity({
                user_name: profile.user_name,
                first_name: profile.first_name,
                last_name: profile.last_name,
                contact: profile.contact,
                address: profile.address,
                membership_date: profile.membership_date,
                status: profile.status as ProfileStatus,
                total_fines: profile.total_fines.toNumber(),
                updated_at: profile.updated_at,
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }


    async delete(parameter: ProfileRepoDeleteDto): Promise<void> {
        try {
            await this.prisma.profiles.delete({
                where: { user_id: parameter.user_id },
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }
}
