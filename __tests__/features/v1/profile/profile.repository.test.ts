import {
    ProfileEntity,
    ProfileRepository,
} from "../../../../src/features/v1/profile";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";
import { IProfileRepository } from "../../../../src/features/v1/profile/types";
import {
    createMockPrisma,
    createDefaultProfileData,
} from "../../../__mocks__/prisma.test-utils";
import { PrismaClient } from "@prisma/client/extension";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((e) => e),
        }),
    },
}));

describe("Profile Repository unit test suite", () => {
    let mapErrorMock = ErrorMapperGroup.getInstance().mapError as jest.Mock;
    let prismaMock = createMockPrisma();
    let upsertMock: jest.Mock = prismaMock.profiles.upsert as jest.Mock;
    let findUniqueOrThrowMock: jest.Mock = prismaMock.profiles
        .findUniqueOrThrow as jest.Mock;
    let deleteMock: jest.Mock = prismaMock.profiles.delete as jest.Mock;
    let profileDefaultEntity = createDefaultProfileData();
    let profileRepository: IProfileRepository;
    const defaultIdHolder = "dummyId";
    beforeAll(() => {
        profileRepository = new ProfileRepository(prismaMock as PrismaClient);
    });

    beforeEach(() => {
        upsertMock.mockResolvedValue(createDefaultProfileData());
        findUniqueOrThrowMock.mockResolvedValue(createDefaultProfileData());
        deleteMock.mockResolvedValue(createDefaultProfileData());
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    async function profileRepoSaveCall(includeReturn: boolean): Promise<any> {
        if (includeReturn)
            return await profileRepository.save({
                user_id: defaultIdHolder,
            });
        else {
            await profileRepository.save({ user_id: defaultIdHolder });
        }
    }

    async function profileRepoFindByIdCall(
        includeReturn: boolean,
    ): Promise<any> {
        if (includeReturn)
            return await profileRepository.findById({
                user_id: defaultIdHolder,
            });
        else {
            await profileRepository.findById({ user_id: defaultIdHolder });
        }
    }

    async function profileRepoDeleteCall(): Promise<any> {
        return profileRepository.delete({ user_id: defaultIdHolder });
    }

    function getMockCalls(parameter: jest.Mock) {
        return parameter.mock.calls[0][0];
    }

    function setMockCallResolveError(
        parameter: jest.Mock,
        errorMessage: string,
    ) {
        return parameter.mockRejectedValue(new Error(errorMessage));
    }

    function isProfileEntity(value: any): boolean {
        return value instanceof ProfileEntity;
    }

    describe("save()", () => {
        it("Should persist and return profile entity", async () => {
            let user = await profileRepoSaveCall(true);
            expect(isProfileEntity(user)).toBeTruthy();
        });

        it("should execute an prisma upsert method with the correct input and provided data", async () => {
            await profileRepoSaveCall(false);
            expect(upsertMock).toHaveBeenCalled();
            expect(getMockCalls(upsertMock)).toHaveProperty("where");
            expect(getMockCalls(upsertMock).where).toHaveProperty("user_id");
            expect(getMockCalls(upsertMock).where.user_id).toBe("dummyId");
            expect(getMockCalls(upsertMock)).toHaveProperty("update");
            expect(getMockCalls(upsertMock)).toHaveProperty("create");
            // add more later
        });

        it("Should delegate to ErrorMapperGroup error and rethrow when when prisma failed", async () => {
            setMockCallResolveError(upsertMock, "prisma error");
            await expect(profileRepoSaveCall(true)).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });

    // ProfileRepository findUniqueOrThrow test
    describe("findById()", () => {
        it("Should presist and return profile entity", async () => {
            let user = await profileRepoFindByIdCall(true);
            expect(isProfileEntity(user)).toBeTruthy();
        });

        it("Should execute prisma.findUniqueOrThrow with correct input and provided data", async () => {
            await profileRepoFindByIdCall(false);
            expect(findUniqueOrThrowMock).toHaveBeenCalled();
            expect(getMockCalls(findUniqueOrThrowMock)).toHaveProperty("where");
            expect(getMockCalls(findUniqueOrThrowMock).where).toHaveProperty(
                "user_id",
            );
            expect(getMockCalls(findUniqueOrThrowMock).where.user_id).toBe(
                defaultIdHolder,
            );
        });

        it("Should delegate to ErrorMapperGroup error and rethrow when when prisma failed", async () => {
            setMockCallResolveError(findUniqueOrThrowMock, "prisma error");
            await expect(profileRepoFindByIdCall(true)).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });

    // ProfileRepository delete test
    describe("delete()", () => {
        it("Should execute prisma.delete with correct input and provided data", async () => {
            await profileRepoDeleteCall();
            expect(deleteMock).toHaveBeenCalled();
            expect(getMockCalls(deleteMock)).toHaveProperty("where");
            expect(getMockCalls(deleteMock).where).toHaveProperty("user_id");
            expect(getMockCalls(deleteMock).where.user_id).toBe(
                defaultIdHolder,
            );
        });
        it("Should delegate to ErrorMapperGroup error and rethrow when when prisma failed", async () => {
            setMockCallResolveError(deleteMock, "prisma error");
            await expect(profileRepoDeleteCall()).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });
});
