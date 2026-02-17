import { IUserRepository } from "../../src/features/v1/user/types";
import { UserEntity, UserRepository } from "../../src/features/v1/user";
import { PrismaClient } from "@prisma/client/extension";

export function createUserRepositoryMock(): IUserRepository {
    let userRepository = new UserRepository({} as PrismaClient);

    jest.spyOn(userRepository, "updateUser");

    jest.spyOn(userRepository, "deleteUser");

    jest.spyOn(userRepository, "createNewUser");

    jest.spyOn(userRepository, "getUserByEmail");

   return userRepository;
}
