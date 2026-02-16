import { PrismaClient } from "@prisma/client";
import { IUserEntity, IUserRepository } from "./types";
import { CreateUserDto, DeleteUserDto, GetUserDto, UpdateUserDto } from "./dto";
import { UserEntity } from "./user.entity";

import { ErrorMapperGroup } from "../../../core/error/mappers";
import { ClientErrorFactory } from "../../../core/error/exceptions";

export class UserRepository implements IUserRepository {
    public readonly prisma: PrismaClient;
    public constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createNewUser(dto: CreateUserDto): Promise<IUserEntity> {
        try {
            let newUser = await this.prisma.users.create({
                data: {
                    email: dto.email,
                    password: dto.password,
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

    async getUserByEmail(dto: GetUserDto): Promise<IUserEntity> {
        try {
            const userFound = await this.prisma.users.findUnique({
                where: {
                    email: dto.data.email,
                },
            });

            if (userFound == null) {
                throw ClientErrorFactory.createEmailNotFoundError({
                    context: { data_recieved: dto },
                });
            }
            return new UserEntity({
                user_id: userFound.user_id,
                email: userFound.email,
                password: userFound.password,
                role: userFound.role,
                created_at: userFound.created_at as Date,
                updated_at: userFound.updated_at as Date,
            });
        } catch (error) {
            error = ErrorMapperGroup.getInstance().mapError(error);
            throw error;
        }
    }

    async deleteUser(dto: DeleteUserDto): Promise<void> {
        try {
            await this.prisma.users.delete({
                where: {
                    user_id: dto.token.id,
                    email: dto.token.email,
                },
            });
            return;
        } catch (error) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    async updateUser(dto: UpdateUserDto): Promise<IUserEntity> {
        try {
            let user = await this.prisma.users.update({
                where: { user_id: dto.token.id },
                data: {
                    email: (dto.data.email as string) ?? undefined,
                    password: (dto.data.password as string) ?? undefined,
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
}
