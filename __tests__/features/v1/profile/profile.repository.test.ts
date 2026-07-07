import { ProfileEntity, ProfileRepository } from "../../../../src/features/v1/profile";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";
import { IProfileRepository } from "../../../../src/features/v1/profile/types";
import { createMockPrisma, mk_prismaProfileMethod } from "../../../__mocks__/prisma.test-utils";
import { getMockCalls, testHaveProperties } from "../../../__helper__/mockHelper";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((e) => e),
        }),
    },
}));
const mockPrisma = createMockPrisma();
const mockPrismaProfileTable = mk_prismaProfileMethod(mockPrisma);

describe("Profile Repository unit test suite", () => {
    let mapErrorMock = ErrorMapperGroup.getInstance().mapError as jest.Mock;
    let profileRepository: IProfileRepository;
    const defaultIdHolder = "dummyId";

    beforeAll(() => {
        profileRepository = new ProfileRepository(mockPrisma);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    function isProfileEntity(value: any): boolean {
        return value instanceof ProfileEntity;
    }

    // profileRepoSave test

    describe("save()", () => {
        async function profileRepoSaveCall(includeReturn: boolean): Promise<any> {
            if (includeReturn)
                return await profileRepository.save({
                    user_id: defaultIdHolder,
                });
            else {
                await profileRepository.save({ user_id: defaultIdHolder });
            }
        }
        beforeEach(() => {
            mockPrismaProfileTable.upsert.declareMockResolvedValue();
        });
        afterEach(() => {
            mockPrismaProfileTable.upsert.executeClearMock();
            jest.clearAllMocks();
        });

        it("Should persist and return profile entity", async () => {
            let profile = await profileRepoSaveCall(true);
            let expected = new ProfileEntity(mockPrismaProfileTable.upsert.getCurrentResolvedValue());
            expect(isProfileEntity(profile)).toBeTruthy();
            expect(profile).toEqual(expected);
        });

        it("should execute an prisma upsert method with the correct input and provided data", async () => {
            await profileRepoSaveCall(false);
            expect(mockPrismaProfileTable.upsert.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockPrismaProfileTable.upsert.getCalls(), ["where", "update", "create"]);
            testHaveProperties(mockPrismaProfileTable.upsert.getCalls().update, [
                "user_name",
                "first_name",
                "last_name",
                "contact",
                "address",
                "membership_date",
                "status",
                "total_fines",
                "updated_at",
            ]);
            testHaveProperties(mockPrismaProfileTable.upsert.getCalls().create, [
                "user_id",
                "user_name",
                "first_name",
                "last_name",
                "contact",
                "address",
                "membership_date",
                "status",
                "total_fines",
                "updated_at",
            ]);
            expect(mockPrismaProfileTable.upsert.getCalls().where.user_id).toBe(defaultIdHolder);
        });

        it("should delegate to errormappergroup error and rethrow when when prisma failed", async () => {
            mockPrismaProfileTable.upsert.setMockResolveError("prisma error");
            await expect(profileRepoSaveCall(true)).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });

    // profilerepository finduniqueorthrow test

    describe("findbyid()", () => {
        async function profileRepoFindByIdCall(includeReturn: boolean): Promise<any> {
            if (includeReturn)
                return await profileRepository.findById({
                    user_id: defaultIdHolder,
                });
            else {
                await profileRepository.findById({ user_id: defaultIdHolder });
            }
        }

        beforeEach(() => {
            mockPrismaProfileTable.findUniqueOrThrow.declareMockResolvedValue();
        });
        afterEach(() => {
            mockPrismaProfileTable.findUniqueOrThrow.executeClearMock();
            jest.clearAllMocks();
        });

        it("Should presist and return profile entity", async () => {
            let profile = await profileRepoFindByIdCall(true);
            let expected = new ProfileEntity(mockPrismaProfileTable.findUniqueOrThrow.getCurrentResolvedValue());
            expect(isProfileEntity(profile)).toBeTruthy();
            expect(profile).toEqual(expected);
        });

        it("Should execute prisma.finduniqueorthrow with correct input and provided data", async () => {
            mockPrismaProfileTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: defaultIdHolder,
                user_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().user_name,
                first_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().first_name,
                last_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().last_name,
                contact: mockPrismaProfileTable.upsert.getDefaultResolvedValue().contact,
                address: mockPrismaProfileTable.upsert.getDefaultResolvedValue().address,
                membership_date: mockPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: mockPrismaProfileTable.upsert.getDefaultResolvedValue().status,
                total_fines: mockPrismaProfileTable.upsert.getDefaultResolvedValue().total_fines,
                updated_at: mockPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });

            await profileRepoFindByIdCall(false);
            expect(mockPrismaProfileTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.findUniqueOrThrow.getCalls()).toHaveProperty("where");
            expect(mockPrismaProfileTable.findUniqueOrThrow.getCalls().where).toHaveProperty("user_id");
            expect(mockPrismaProfileTable.findUniqueOrThrow.getCalls().where.user_id).toBe(defaultIdHolder);
        });

        it("Should delegate to ErrorMapperGroup error and rethrow when when prisma failed", async () => {
            mockPrismaProfileTable.findUniqueOrThrow.setMockResolveError("prisma error");
            await expect(profileRepoFindByIdCall(true)).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });

    // profilerepository delete test
    describe("delete()", () => {
        async function profileRepoDeleteCall(): Promise<any> {
            return profileRepository.delete({ user_id: defaultIdHolder });
        }
        beforeEach(() => {
            mockPrismaProfileTable.delete.declareMockResolvedValue();
        });

        afterEach(() => {
            mockPrismaProfileTable.delete.executeClearMock();
        });

        it("should execute prisma.delete with correct input and provided data", async () => {
            mockPrismaProfileTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: defaultIdHolder,
                user_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().user_name,
                first_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().first_name,
                last_name: mockPrismaProfileTable.upsert.getDefaultResolvedValue().last_name,
                contact: mockPrismaProfileTable.upsert.getDefaultResolvedValue().contact,
                address: mockPrismaProfileTable.upsert.getDefaultResolvedValue().address,
                membership_date: mockPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: mockPrismaProfileTable.upsert.getDefaultResolvedValue().status,
                total_fines: mockPrismaProfileTable.upsert.getDefaultResolvedValue().total_fines,
                updated_at: mockPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });
            await profileRepoDeleteCall();
            expect(mockPrismaProfileTable.delete.getMockfn()).toHaveBeenCalled();
            mockPrismaProfileTable.delete.getCalls();
            expect(mockPrismaProfileTable.delete.getCalls()).toHaveProperty("where");
            expect(mockPrismaProfileTable.delete.getCalls().where).toHaveProperty("user_id");
            expect(mockPrismaProfileTable.delete.getCalls().where.user_id).toBe(defaultIdHolder);
        });

        it("should delegate to errormappergroup error and rethrow when when prisma failed", async () => {
            mockPrismaProfileTable.delete.setMockResolveError("prisma error");
            await expect(profileRepoDeleteCall()).rejects.toThrow();
            expect(mapErrorMock).toHaveBeenCalled();
            expect(getMockCalls(mapErrorMock).message).toBe("prisma error");
        });
    });
});
