import { IUserRepository } from "../../src/features/v1/user/types";
import { UserRepository } from "../../src/features/v1/user";
import { PrismaClient } from "@prisma/client/extension";
import { createMockPrisma } from "./prisma.mock";

export function createUserRepositoryMock(): IUserRepository {
    let userRepository = new UserRepository({} as PrismaClient);

    jest.spyOn(userRepository, "create");

    jest.spyOn(userRepository, "delete");

    jest.spyOn(userRepository, "update");

    jest.spyOn(userRepository, "getByEmail");

   return userRepository;
}

export function createUserRepositoryFakes(prismaClientMock:PrismaClient): IUserRepository {
    let userRepository = new UserRepository(prismaClientMock);
    return userRepository;
}
