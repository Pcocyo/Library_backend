import { createProfileRepositoryMock } from "../../../__mocks__/profileRepository.test-utils";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.test-utils";
import {
    createMockPrisma,
    mk_prismaProfileMethod,
    mk_prismaUserMethod,
    createCustomProfileDb,
} from "../../../__mocks__/prisma.test-utils";
import { ProfileService } from "../../../../src/features/v1/profile";
import { ProfileStatus } from "../../../../src/features/v1/profile/types";
import { IProfileService } from "../../../../src/features/v1/profile/types";
import {
    createGetProfileDto,
    createProfileUpdateDto,
    createLibrarianProfileDto,
} from "../../../__mocks__/request.dto.mock";
import { ProfileEntity } from "../../../../src/features/v1/profile";
import { Prisma } from "@prisma/client";
import { testHaveProperties } from "../../../__helper__/mockHelper";

const mockedPrisma = createMockPrisma();
const mockedPrismaProfileTable = mk_prismaProfileMethod(mockedPrisma);
const mockedPrismaUserTable = mk_prismaUserMethod(mockedPrisma);

describe("Profile Service Unit Test Suite", () => {
    const profileRepositoryMock = createProfileRepositoryMock(mockedPrisma);
    const userRepositoryMock = createUserRepositoryMock(mockedPrisma);
    let profileService: IProfileService;

    beforeAll(() => {
        profileService = new ProfileService({
            userRepository: userRepositoryMock,
            profileRepository: profileRepositoryMock,
        });
    });

    describe("findById()", () => {
        const email = "dummyEmail";
        const id = "dummyId";
        const role = "dummyRole";

        const executeFindById = async (email: string, id: string, role: string) => {
            return await profileService.findById(createGetProfileDto({ email: email, id: id, role: role }));
        };

        beforeAll(() => {
            mockedPrismaProfileTable.findUniqueOrThrow.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaProfileTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should use profileRepository.findById and call it with the correct data", async () => {
            mockedPrismaProfileTable.findUniqueOrThrow.setCustomResolvedvalue(createCustomProfileDb(id));
            await executeFindById(email, id, role);
            expect(mockedPrismaProfileTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaProfileTable.findUniqueOrThrow.getCalls(), ["where"]);
            expect(mockedPrismaProfileTable.findUniqueOrThrow.getCalls().where.user_id).toBe(id);
        });

        it("Should return ProfileEntity", async () => {
            const profile = await executeFindById(email, id, role);
            const expectedProfileEntity = new ProfileEntity(
                mockedPrismaProfileTable.findUniqueOrThrow.getCurrentResolvedValue(),
            );
            expect(profile).toEqual(expectedProfileEntity);
        });
    });

    describe("updateSelf()", () => {
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
            mockedPrismaProfileTable.upsert.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaProfileTable.upsert.executeClearMock();
        });
        afterAll(() => {});
        it("Should call profileRepository.save with the correct data", async () => {
            await executeUpdateSelf(defaultRequest, defaultAuth);
            expect(mockedPrismaProfileTable.upsert.getCalls().where.user_id).toBe(defaultAuth.id);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.user_name).toBe(defaultRequest.user_name);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.first_name).toBe(defaultRequest.first_name);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.last_name).toBe(defaultRequest.last_name);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.contact).toBe(defaultRequest.contact);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.address).toBe(defaultRequest.address);
        });

        it("Should return profile entity", async () => {
            mockedPrismaProfileTable.upsert.setCustomResolvedvalue({
                user_id: defaultAuth.id,
                user_name: user_name,
                first_name: first_name,
                last_name: last_name,
                contact: contact,
                address: address,
                membership_date: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().status,
                total_fines: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().total_fines,
                updated_at: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });
            const profile = await executeUpdateSelf(defaultRequest, defaultAuth);
            const expected = new ProfileEntity(mockedPrismaProfileTable.upsert.getCurrentResolvedValue());
            expect(profile).toEqual(expected);
        });

        it("Should delegate request from null to undefined", async () => {
            mockedPrismaProfileTable.upsert.setCustomResolvedvalue({
                user_id: defaultAuth.id,
                user_name: nullRequest.user_name,
                first_name: nullRequest.first_name,
                last_name: nullRequest.last_name,
                contact: nullRequest.contact,
                address: nullRequest.address,
                membership_date: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().status,
                total_fines: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().total_fines,
                updated_at: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });
            await executeUpdateSelf(nullRequest, defaultAuth);
            expect(mockedPrismaProfileTable.upsert.getCalls().where.user_id).toBe(defaultAuth.id);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.user_name).toBeUndefined();
            expect(mockedPrismaProfileTable.upsert.getCalls().update.first_name).toBeUndefined();
            expect(mockedPrismaProfileTable.upsert.getCalls().update.last_name).toBeUndefined();
            expect(mockedPrismaProfileTable.upsert.getCalls().update.contact).toBeUndefined();
            expect(mockedPrismaProfileTable.upsert.getCalls().update.address).toBeUndefined();
        });
    });

    describe("administrativeUpdate()", () => {
        const defaultRequest = {
            total_fines: 100,
            status: "ACTIVE",
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
            mockedPrismaUserTable.findUniqueOrThrow.declareMockResolvedValue();
            mockedPrismaProfileTable.upsert.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.executeClearMock();
            mockedPrismaProfileTable.upsert.executeClearMock();
        });

        it("Should call userRepostory.getByEmail with correct data", async () => {
            mockedPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().user_id,
                password: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().password,
                role: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().role,
                created_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().created_at,
                updated_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().updated_at,
                email: defaultRequest.email,
            });
            await executeAdminUpdate(defaultRequest, defaultAuth);
            expect(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where.email).toBe(defaultRequest.email);
        });

        it("Should call profileRepository.save with correct data", async () => {
            mockedPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().user_id,
                password: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().password,
                role: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().role,
                created_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().created_at,
                updated_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().updated_at,
                email: defaultRequest.email,
            });
            mockedPrismaProfileTable.upsert.setCustomResolvedvalue({
                user_id: mockedPrismaUserTable.findUniqueOrThrow.getCurrentResolvedValue().user_id,
                user_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().user_name,
                first_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().first_name,
                last_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().last_name,
                contact: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().contact,
                address: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().address,
                membership_date: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: defaultRequest.status as ProfileStatus,
                total_fines: new Prisma.Decimal(defaultRequest.total_fines),
                updated_at: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });
            await executeAdminUpdate(defaultRequest, defaultAuth);
            expect(mockedPrismaProfileTable.upsert.getCalls().where.user_id).toBe(
                mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().user_id,
            );
            expect(mockedPrismaProfileTable.upsert.getCalls().update.status).toBe(defaultRequest.status);
            expect(mockedPrismaProfileTable.upsert.getCalls().update.total_fines.toNumber()).toBe(
                defaultRequest.total_fines,
            );
        });

        it("Should return profile entity", async () => {
            mockedPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().user_id,
                password: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().password,
                role: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().role,
                created_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().created_at,
                updated_at: mockedPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue().updated_at,
                email: defaultRequest.email,
            });
            mockedPrismaProfileTable.upsert.setCustomResolvedvalue({
                user_id: mockedPrismaUserTable.findUniqueOrThrow.getCurrentResolvedValue().user_id,
                user_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().user_name,
                first_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().first_name,
                last_name: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().last_name,
                contact: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().contact,
                address: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().address,
                membership_date: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().membership_date,
                status: defaultRequest.status as ProfileStatus,
                total_fines: new Prisma.Decimal(defaultRequest.total_fines),
                updated_at: mockedPrismaProfileTable.upsert.getDefaultResolvedValue().updated_at,
            });
            const profile = await executeAdminUpdate(defaultRequest, defaultAuth);
            const expected = new ProfileEntity(mockedPrismaProfileTable.upsert.getCurrentResolvedValue());
            expect(profile).toEqual(expected);
        });
    });
});
