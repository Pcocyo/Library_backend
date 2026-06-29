import { IUserRepository } from "../../src/features/v1/user/types";
import { UserRepository } from "../../src/features/v1/user";
import { PrismaClient } from "@prisma/client/extension";

export function createUserRepositoryMock(prismaClientMock:PrismaClient): IUserRepository {
    let userRepository = new UserRepository(prismaClientMock);
    return userRepository;
}
