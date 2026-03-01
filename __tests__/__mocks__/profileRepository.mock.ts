import { PrismaClient } from "@prisma/client/extension";
import { IProfileRepository } from "../../src/features/v1/profile/types";
import { ProfileRepository } from "../../src/features/v1/profile";

export function createProfileRepositoryMock(): IProfileRepository {
    let profileRepository = new ProfileRepository({} as PrismaClient);
    jest.spyOn(profileRepository, "save");

    jest.spyOn(profileRepository, "delete");

    jest.spyOn(profileRepository, "findById");

    return profileRepository;
}
