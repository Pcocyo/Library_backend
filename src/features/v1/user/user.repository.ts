import { PrismaClient } from "@prisma/client";
import {
    IUserEntity,
    IUserRepository,
    UserRepoCreateDto,
    UserRepoDeleteDto,
    UserRepoGetByEmailDto,
    UserRepoUpdateDto,
} from "./types";
import { UserEntity } from "./user.entity";
import { ErrorMapperGroup } from "../../../core/error/mappers";
import { UserRepoSaveDto } from "./types/user.repository.types";

export class UserRepository implements IUserRepository {
    public readonly prisma: PrismaClient;

    public constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    public async create(parameter: UserRepoCreateDto): Promise<IUserEntity> {
        try {
            let newUser = await this.prisma.users.create({
                data: {
                    email: parameter.email,
                    password: parameter.password,
                },
            });
            return new UserEntity({
                user_id: newUser.user_id,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                created_at: newUser.created_at,
                updated_at: newUser.updated_at as Date,
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }
    public async getByEmail(parameter: UserRepoGetByEmailDto): Promise<IUserEntity> {
        try {
            let user = await this.prisma.users.findUniqueOrThrow({
                where: {
                    email: parameter.email,
                },
            });

            return new UserEntity({
                user_id: user.user_id,
                email: user.email,
                password: user.password,
                role: user.role,
                created_at: user.created_at as Date,
                updated_at: user.updated_at as Date,
            });
        } catch (error) {
            error = ErrorMapperGroup.getInstance().mapError(error);
            throw error;
        }
    }

    public async delete(parameter: UserRepoDeleteDto): Promise<void> {
        try {
            await this.prisma.users.delete({
                where: {
                    user_id: parameter.user_id,
                    email: parameter.email,
                },
            });
            return;
        } catch (error) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    public async update(parameter: UserRepoUpdateDto): Promise<IUserEntity> {
        try {
            let user = await this.prisma.users.update({
                where: { user_id: parameter.user_id },
                data: {
                    email: parameter.email,
                    password: parameter.password,
                    role: parameter.role,
                    updated_at: new Date(),
                },
            });

            return new UserEntity({
                user_id: user.user_id,
                email: user.email,
                password: user.password,
                role: user.role,
                created_at: user.created_at as Date,
                updated_at: user.updated_at as Date,
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    public async save(parameter: UserRepoSaveDto): Promise<void> {
        try {
            await this.prisma.users.upsert({
                where: {
                    email: parameter.email,
                },
                update: {
                    role: parameter.role as string,
                    password: parameter.password as string,
                    updated_at: parameter.updatedAt,
                },
                create: {
                    email: parameter.email,
                    role: parameter.role as string,
                    password: parameter.password as string,
                    updated_at: parameter.updatedAt,
                },
            });
        } catch (error: unknown) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }
}
