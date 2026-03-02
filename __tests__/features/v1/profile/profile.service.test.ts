import { createProfileRepositoryFakes } from "../../../__mocks__/profileRepository.mock";
import { createUserRepositoryFakes } from "../../../__mocks__/userRepository.mock";
import { createDefaultProfileData, createMockPrisma, createDefaultUserDb } from "../../../__mocks__/prisma.mock";
import { ProfileService } from "../../../../src/features/v1/profile";
import { IProfileService } from "../../../../src/features/v1/profile/types";
import {
    createGetProfileDto,
    createProfileUpdateDto,
    createLibrarianProfileDto,
} from "../../../__mocks__/request.dto.mock";
import { getMockCalls, getMockResolvedValue, testHaveProperties } from "../../../__helper__/mockHelper";

describe("Profile Service Unit Test Suite", () => {
    const prismaMock = createMockPrisma();
    const profileRepositoryFakes = createProfileRepositoryFakes(prismaMock);
    const userRepositoryFakes = createUserRepositoryFakes(prismaMock);
    let profileService: IProfileService;

    const profileEntityProperties: string[] = [
        "user_name",
        "first_name",
        "last_name",
        "contact",
        "address",
        "membership_date",
        "status",
        "total_fines",
        "updated_at",
    ];
    beforeAll(() => {
        profileService = new ProfileService({
            userRepository: userRepositoryFakes,
            profileRepository: profileRepositoryFakes,
        });
    });

    describe("getById()", () => {
        const email = "dummyEmail";
        const id = "dummyId";
        const role = "dummyRole";
        const MockPrisma_findUniqueOrThrow: jest.Mock = prismaMock.profiles.findUniqueOrThrow;
        const executeFindById = async (email: string, id: string, role: string) => {
            return await profileService.findById(createGetProfileDto({ email: email, id: id, role: role }));
        };

        beforeAll(() => {
            MockPrisma_findUniqueOrThrow.mockResolvedValue(createDefaultProfileData());
        });
        afterEach(() => {
            MockPrisma_findUniqueOrThrow.mockClear();
        });

        afterAll(() => {
            MockPrisma_findUniqueOrThrow.mockReset();
        });

        it("Should use profileRepository.findById and call it with the correct data", async () => {
            await executeFindById(email, id, role);
            expect(getMockCalls(MockPrisma_findUniqueOrThrow).where.user_id).toBe(id);
        });

        it("Should return ProfileEntity", async () => {
            const profile = await executeFindById(email, id, role);
            testHaveProperties(profile, profileEntityProperties);
        });
    });

    describe("updateSelf()", () => {
        const MockPrisma_upsert: jest.Mock = prismaMock.profiles.upsert;
        const user_name = "dummy_user_name";
        const first_name = "dummy_first_name";
        const last_name = "dummy_last_name";
        const contact = "dummy_contact";
        const address = "dummy_address";
        const defaultRequest = {
            user_name: user_name,
            address: address,
            first_name: first_name,
            last_name: last_name,
            contact: contact,
        };
        const nullRequest = {
            user_name: null,
            address: null,
            first_name: null,
            last_name: null,
            contact: null,
        };

        const defaultAuth = {
            email: "dummyEmail",
            id: "dummyId",
            role: "dummyRole",
        };

        const executeUpdateSelf = async (
            param: {
                user_name: string | null;
                first_name: string | null;
                last_name: string | null;
                contact: string | null;
                address: string | null;
            },
            auth: {
                email: string;
                id: string;
                role: string;
            },
        ) => {
            return await profileService.updateSelf(createProfileUpdateDto({ ...param }, { ...auth }));
        };
        beforeAll(() => {
            MockPrisma_upsert.mockResolvedValue(createDefaultProfileData());
        });
        afterEach(() => {
            MockPrisma_upsert.mockClear();
        });
        afterAll(() => {
            MockPrisma_upsert.mockReset();
        });
        it("Should call profileRepository.save with the correct data", async () => {
            await executeUpdateSelf(defaultRequest, defaultAuth);
            expect(getMockCalls(MockPrisma_upsert).where.user_id).toBe(defaultAuth.id);
            expect(getMockCalls(MockPrisma_upsert).update.user_name).toBe(defaultRequest.user_name);
            expect(getMockCalls(MockPrisma_upsert).update.first_name).toBe(defaultRequest.first_name);
            expect(getMockCalls(MockPrisma_upsert).update.last_name).toBe(defaultRequest.last_name);
            expect(getMockCalls(MockPrisma_upsert).update.contact).toBe(defaultRequest.contact);
            expect(getMockCalls(MockPrisma_upsert).update.address).toBe(defaultRequest.address);
        });

        it("Should return profile entity", async () => {
            const profile = await executeUpdateSelf(defaultRequest, defaultAuth);
            testHaveProperties(profile, profileEntityProperties);
        });

        it("Should delegate request from null to undefined", async () => {
            await executeUpdateSelf(nullRequest, defaultAuth);
            expect(getMockCalls(MockPrisma_upsert).where.user_id).toBe(defaultAuth.id);
            expect(getMockCalls(MockPrisma_upsert).update.user_name).toBeUndefined();
            expect(getMockCalls(MockPrisma_upsert).update.first_name).toBeUndefined();
            expect(getMockCalls(MockPrisma_upsert).update.last_name).toBeUndefined();
            expect(getMockCalls(MockPrisma_upsert).update.contact).toBeUndefined();
            expect(getMockCalls(MockPrisma_upsert).update.address).toBeUndefined();
        });
    });

    describe("administrativeUpdate()", () => {
        const MockPrisma_upsert: jest.Mock = prismaMock.profiles.upsert;
        const MockPrisma_findUniqueOrThrow: jest.Mock = prismaMock.users.findUniqueOrThrow;

        const defaultRequest = {
            total_fines: 10,
            status: "test status",
            email: "test dummy email",
        };

        const defaultAuth = {
            email: "dummyEmail",
            id: "dummyId",
            role: "dummyRole",
        };

        const executeAdminUpdate = async (
            param: {
                total_fines: number | null;
                status: string | null;
                email: string;
            },
            auth: {
                email: string;
                id: string;
                role: string;
            },
        ) => {
            return await profileService.administrativeUpdate(createLibrarianProfileDto({ ...param }, { ...auth }));
        };

        beforeAll(() => {
            MockPrisma_findUniqueOrThrow.mockResolvedValue(createDefaultUserDb());
            MockPrisma_upsert.mockResolvedValue(createDefaultProfileData());
        });

        afterEach(() => {
            MockPrisma_upsert.mockClear();
            MockPrisma_findUniqueOrThrow.mockClear();
        });

        afterAll(() => {
            MockPrisma_upsert.mockReset();
            MockPrisma_findUniqueOrThrow.mockReset();
        });

        it("Should call userRepostory.getByEmail with correct data", async () => {
            await executeAdminUpdate(defaultRequest, defaultAuth);
            const mockCall = getMockCalls(MockPrisma_findUniqueOrThrow);
            expect(mockCall.where.email).toBe(defaultRequest.email);
        });

        it("Should call profileRepository.save with correct data", async () => {
            await executeAdminUpdate(defaultRequest, defaultAuth);
            const findUniqueReturn = await getMockResolvedValue(MockPrisma_findUniqueOrThrow);
            expect(getMockCalls(MockPrisma_upsert).where.user_id).toBe(findUniqueReturn.user_id);
            expect(getMockCalls(MockPrisma_upsert).update.status).toBe(defaultRequest.status);
            expect(getMockCalls(MockPrisma_upsert).update.total_fines).toBe(defaultRequest.total_fines);
        });

        it("Should return profile entity", async () => {
            const profile = await executeAdminUpdate(defaultRequest, defaultAuth);
            testHaveProperties(profile,profileEntityProperties);
        });
    });
});
