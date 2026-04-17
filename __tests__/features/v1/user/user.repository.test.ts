import { UserRepository, UserEntity } from "../../../../src/features/v1/user";
import {
    DeleteUserDto,
    GetUserDto,
    UpdateUserDto,
} from "../../../../src/features/v1/user/dto";
import {
    createMockPrisma,
    createDefaultUserDb,
} from "../../../__mocks__/prisma.test-utils";
import { Request } from "express";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";
import { IUserEntity } from "../../../../src/features/v1/user/types";
import { email } from "zod";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((error) => error),
        }),
    },
}));

describe("User Repository Unit Test Suite", () => {
    let mockedPrisma = createMockPrisma();
    let mockCreatePrisma: jest.Mock = mockedPrisma.users.create as jest.Mock;
    let mockDeletePrisma: jest.Mock = mockedPrisma.users.delete as jest.Mock;
    let mockUpdatePrisma: jest.Mock = mockedPrisma.users.update as jest.Mock;
    let mockfindUniquePrisma: jest.Mock = mockedPrisma.users
        .findUniqueOrThrow as jest.Mock;
    let mockedMapError: jest.Mock = ErrorMapperGroup.getInstance()
        .mapError as jest.Mock;
    let repoInstance: UserRepository;
    let request: Partial<Request> = { headers: {}, body: {} };
    let defaultEmailHolder: string = "dummyEmail";
    let defaultPasswordHolder: string = "dummyPassword";
    let defaultIdHolder: string = "dummyId";
    let defaultRoleHolder: string = "GUEST";

    afterEach(() => {
        jest.clearAllMocks();
        request = { headers: {}, body: {} };
    });

    beforeAll(() => {
        repoInstance = new UserRepository(mockedPrisma as any);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    beforeEach(() => {
        mockCreatePrisma.mockResolvedValue(createDefaultUserDb());
        mockDeletePrisma.mockResolvedValue(createDefaultUserDb());
        mockUpdatePrisma.mockResolvedValue(createDefaultUserDb());
        mockfindUniquePrisma.mockResolvedValue(createDefaultUserDb());
    });

    // helper function
    function getMockCalls(parameter: jest.Mock) {
        return parameter.mock.calls[0][0];
    }

    function setMockResolveError(parameter: jest.Mock, errorMessage: string) {
        parameter.mockRejectedValue(new Error(errorMessage));
    }

    function isMapErrorCalledWith(expectedErrorMessage: string) {
        expect(mockedMapError).toHaveBeenCalled();
        expect(getMockCalls(mockedMapError).message).toBe(expectedErrorMessage);
    }

    // repository calls
    async function repoInstanceCreateNew(includeReturn: boolean): Promise<any> {
        if (includeReturn)
            return await repoInstance.create({
                email: defaultEmailHolder,
                password: defaultPasswordHolder,
            });
        else
            await repoInstance.create({
                email: defaultEmailHolder,
                password: defaultPasswordHolder,
            });
    }

    async function repoInstanceGetByEmail(
        includeReturn: boolean,
    ): Promise<any> {
        if (includeReturn)
            return await repoInstance.getByEmail({
                email: defaultEmailHolder,
            });
        else
            await repoInstance.getByEmail({
                email: defaultEmailHolder,
            });
    }

    async function repoInstanceDelete(): Promise<any> {
        return await repoInstance.delete({
            email: defaultEmailHolder,
            user_id: defaultIdHolder,
        });
    }

    async function repoInstanceUpdate(includeReturn: boolean): Promise<any> {
        if (includeReturn)
            return await repoInstance.update({
                email: defaultEmailHolder,
                password: defaultPasswordHolder,
                role: defaultRoleHolder,
            } as any);
        else
            await repoInstance.update({
                email: defaultEmailHolder,
                password: defaultPasswordHolder,
                role: defaultRoleHolder,
            } as any);
    }

    async function isUserEntity(parameter: any) {
        expect(parameter).toBeInstanceOf(UserEntity);
    }

    describe("create()", () => {
        //repository create user tests
        it("Should call prisma.user.create with correct data", async () => {
            await repoInstanceCreateNew(false);

            expect(mockCreatePrisma).toHaveBeenCalled();
            expect(getMockCalls(mockCreatePrisma)).toHaveProperty("data");
            expect(getMockCalls(mockCreatePrisma).data).toHaveProperty("email");
            expect(getMockCalls(mockCreatePrisma).data).toHaveProperty(
                "password",
            );
            expect(getMockCalls(mockCreatePrisma).data.email).toBe(
                defaultEmailHolder,
            );
            expect(getMockCalls(mockCreatePrisma).data.password).toBe(
                defaultPasswordHolder,
            );
        });

        it("Should return a UserEntity when succesfully persisted", async () => {
            let user = await repoInstanceCreateNew(true);
            expect(user).toBeInstanceOf(UserEntity);
        });

        it("Should throw a mapped error when Prisma fails", async () => {
            setMockResolveError(mockCreatePrisma, "prisma error");
            await expect(repoInstanceCreateNew(true)).rejects.toThrow();
            isMapErrorCalledWith("prisma error");
        });
    });

    //repository get by email test
    describe("getByEmail()", () => {
        it("Should call prisma.user.findUniqueOrThrow with the correct data", async () => {
            repoInstanceGetByEmail(false);
            expect(mockfindUniquePrisma).toHaveBeenCalled();
            expect(getMockCalls(mockfindUniquePrisma)).toHaveProperty("where");
            expect(getMockCalls(mockfindUniquePrisma).where).toHaveProperty(
                "email",
            );
            expect(getMockCalls(mockfindUniquePrisma).where.email).toBe(
                defaultEmailHolder,
            );
        });

        it("Should return a User entity when a record exists", async () => {
            let user = await repoInstanceGetByEmail(true);
            expect(isUserEntity(user)).toBeTruthy;
        });

        it("Should throw a mapped error when Prisma fail", async () => {
            setMockResolveError(mockfindUniquePrisma, "prisma error");
            await expect(repoInstanceGetByEmail(true)).rejects.toThrow();
            isMapErrorCalledWith("prisma error");
        });
    });

    //repository delete user test
    describe("delete()", () => {
        it("Should call prisma.user.delete with the correct data", async () => {
            await repoInstanceDelete();
            expect(mockDeletePrisma).toHaveBeenCalled();
            expect(getMockCalls(mockDeletePrisma)).toHaveProperty("where");
            expect(getMockCalls(mockDeletePrisma).where).toHaveProperty(
                "email",
            );
            expect(getMockCalls(mockDeletePrisma).where).toHaveProperty(
                "user_id",
            );
            expect(getMockCalls(mockDeletePrisma).where.email).toBe(
                defaultEmailHolder,
            );
            expect(getMockCalls(mockDeletePrisma).where.user_id).toBe(
                defaultIdHolder,
            );
        });

        it("Should dalegate into mapped error when Prisma fail", async () => {
            setMockResolveError(mockDeletePrisma, "prisma error");
            await expect(repoInstanceDelete()).rejects.toThrow();
            isMapErrorCalledWith("prisma error");
        });
    });

    //repository update user test
    describe("update()", () => {
        it("repository.updateUser should call prisma.users.update with the correct data", async () => {
            repoInstanceUpdate(false);
            expect(mockUpdatePrisma).toHaveBeenCalled();
            expect(getMockCalls(mockUpdatePrisma)).toHaveProperty("where");
            expect(getMockCalls(mockUpdatePrisma).where).toHaveProperty(
                "user_id",
            );
            expect(getMockCalls(mockUpdatePrisma)).toHaveProperty("data");
            expect(getMockCalls(mockUpdatePrisma).data).toHaveProperty("email");
            expect(getMockCalls(mockUpdatePrisma).data).toHaveProperty(
                "password",
            );
            expect(getMockCalls(mockUpdatePrisma).data).toHaveProperty("role");
            expect(getMockCalls(mockUpdatePrisma).data.email).toBe(
                defaultEmailHolder,
            );
            expect(getMockCalls(mockUpdatePrisma).data.password).toBe(
                defaultPasswordHolder,
            );
            expect(getMockCalls(mockUpdatePrisma).data.role).toBe(
                defaultRoleHolder,
            );
        });

        it("repository.updateUser should return user entity on success", async () => {
            let user = await repoInstanceUpdate(true);
            isUserEntity(user);
        });

        it("repository.updateUser should throw a mapped error when Prisma fail ", async () => {
            setMockResolveError(mockUpdatePrisma, "prisma error");
            await expect(repoInstanceUpdate(true)).rejects.toThrow();
            isMapErrorCalledWith("prisma error");
        });
    });
});
