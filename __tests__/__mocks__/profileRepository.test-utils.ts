import { PrismaClient } from "@prisma/client/extension";
import { IProfileRepository } from "../../src/features/v1/profile/types";
import { ProfileRepository } from "../../src/features/v1/profile";
import { createMockPrisma } from "./prisma.test-utils";

export function createProfileRepositoryMock(): IProfileRepository {
    let profileRepository = new ProfileRepository({} as PrismaClient);
    jest.spyOn(profileRepository, "save");

    jest.spyOn(profileRepository, "delete");

    jest.spyOn(profileRepository, "findById");

    return profileRepository;
}

export function createProfileRepositoryFakes(prismaClientMock:PrismaClient):IProfileRepository{
    let profileRepository = new ProfileRepository(prismaClientMock);
    return profileRepository;
}
