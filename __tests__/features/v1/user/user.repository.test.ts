import { UserRepository, UserEntity } from "../../../../src/features/v1/user";
import {
    DeleteUserDto,
    GetUserDto,
    UpdateUserDto,
} from "../../../../src/features/v1/user/dto";
import { createMockPrisma } from "../../../__mocks__/prisma.mock";
import { Request } from "express";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((error) => error),
        }),
    },
}));

describe("user repository unit test suite", () => {
    let mockedPrisma = createMockPrisma();
    let mockedMapError: jest.Mock = ErrorMapperGroup.getInstance()
        .mapError as jest.Mock;
    let repoInstance: UserRepository;
    let request: Partial<Request> = { headers: {}, body: {} };

    function createGetByUserDto(request: Partial<Request>): GetUserDto {
        request.body = {
            email: "dummyEmail",
            authorizedUser: "authorization-holder",
        };
        return GetUserDto.fromRequest(request as Request);
    }

    function createDeleteUserDto(request: Partial<Request>): DeleteUserDto {
        request.body = {
            authorizedUser: {
                email: "dummyEmail",
                role: "dummyRole",
                id: "dummyId",
            },
        };
        return DeleteUserDto.fromRequest(request as Request);
    }

    function createUpdateUserDto(
        request: Partial<Request>,
        haveNull: boolean,
    ): UpdateUserDto {
        if (haveNull) {
            request.body = {
                authorizedUser: {
                    email: null,
                    password: "newPassword",
                    authorizedUser: {
                        email: "dummyEmail",
                        role: "dummyRole",
                        id: "dummyId",
                    },
                },
            };
        } else {
            request.body = {
                email: "newEmail",
                password: "newPassword",
                authorizedUser: {
                    email: "dummyEmail",
                    role: "dummyRole",
                    id: "dummyId",
                },
            };
        }
        return UpdateUserDto.fromRequest(request as Request);
    }

    function mockPrismaReturnUser(parameter: jest.Mock) {
        parameter.mockResolvedValue({
            user_id: "123",
            email: "test@test.com",
            password: "hash123",
            role: "user",
            created_at: new Date("2024-01-01"),
            updated_at: new Date("2024-01-02"),
        });
    }

    function mockPrismaResolveError(parameter: jest.Mock) {
        parameter.mockResolvedValue(new Error("Error"));
    }

    afterEach(() => {
        jest.clearAllMocks();
        request = { headers: {}, body: {} };
    });

    beforeAll(() => {
        repoInstance = new UserRepository(mockedPrisma as any);
        //repoInstance = new UserRepository(new PrismaClient());
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    //repository create user tests
    it("repository.create should call prisma.user.create with the provided email, password, and role", async () => {
        mockPrismaReturnUser(mockedPrisma.users.create);
        await repoInstance.createNewUser({
            email: "dummyEmail",
            password: "dummyPassword",
        });
        let createPrimsaMockCalls = mockedPrisma.users.create.mock.calls[0][0];
        expect(mockedPrisma.users.create).toHaveBeenCalled();
        expect(createPrimsaMockCalls).toHaveProperty("data");
        expect((createPrimsaMockCalls as any).data).toHaveProperty("email");
        expect((createPrimsaMockCalls as any).data).toHaveProperty("password");
        expect((createPrimsaMockCalls as any).data.email).toEqual("dummyEmail");
        expect((createPrimsaMockCalls as any).data.password).toEqual(
            "dummyPassword",
        );
    });

    it("repository.create should return a UserEntity when a new user is created successfully", async () => {
        mockPrismaReturnUser(mockedPrisma.users.create);
        let user = await repoInstance.createNewUser({
            email: "dummyEmail",
            password: "dummyPassword",
        });
        expect(user).toBeInstanceOf(UserEntity);
    });

    it("repository.create should throw a mapped error when Prisma fails", async () => {
        try {
            (mockedPrisma.users.create as jest.Mock).mockRejectedValue(
                new Error("test"),
            );
            await repoInstance.createNewUser({
                email: "dummyEmail",
                password: "dummyPassword",
            });
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    //repository get by email test
    it("repository.getByUserEmail should call prisma.user.findUnique with the correct data", async () => {
        mockPrismaReturnUser(mockedPrisma.users.findUnique);
        await repoInstance.getUserByEmail(createGetByUserDto(request));
        expect(mockedPrisma.users.findUnique).toHaveBeenCalled();
        expect(mockedPrisma.users.findUnique.mock.calls[0][0]).toHaveProperty(
            "where",
        );
        expect(
            (mockedPrisma.users.findUnique.mock.calls[0][0] as any).where,
        ).toHaveProperty("email");
        expect(
            (mockedPrisma.users.findUnique.mock.calls[0][0] as any).where.email,
        ).toBe("dummyEmail");
    });

    it("repository.getByEmail should return a User entity when a record exists", async () => {
        mockPrismaReturnUser(mockedPrisma.users.findUnique);
        let user = await repoInstance.getUserByEmail(
            createGetByUserDto(request),
        );
        expect(user).toBeInstanceOf(UserEntity);
    });

    it("repository.getByEmail should throw a mapped error when Prisma fail", async () => {
        try {
            mockPrismaResolveError(mockedPrisma.users.findUnique);
            await repoInstance.getUserByEmail(createGetByUserDto(request));
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    //repository delete user test
    it("repository.delete should call prisma.user.delete with the correct data", () => {
        repoInstance.deleteUser(createDeleteUserDto(request));
        let deleteMock = mockedPrisma.users.delete;
        let deleteMockCalls = deleteMock.mock.calls[0][0];
        expect(deleteMock).toHaveBeenCalled();
        expect(deleteMockCalls).toHaveProperty("where");
        expect((deleteMockCalls as any).where).toHaveProperty("email");
        expect((deleteMockCalls as any).where).toHaveProperty("user_id");
        expect((deleteMockCalls as any).where.email).toBe("dummyEmail");
        expect((deleteMockCalls as any).where.user_id).toBe("dummyId");
    });

    it("repository.delete should throw a mapped error when Prisma fail", () => {
        try {
            mockPrismaResolveError(mockedPrisma.users.delete);
            repoInstance.deleteUser(createDeleteUserDto(request));
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    //repository update user test
    it("repository.updateUser should call prisma.users.update with the correct data", async () => {
        mockPrismaReturnUser(mockedPrisma.users.update);
        await repoInstance.updateUser(createUpdateUserDto(request, false));
        let mockedPrismaCalls = mockedPrisma.users.update.mock.calls[0][0];
        expect(mockedPrisma.users.update).toHaveBeenCalled();
        expect(mockedPrismaCalls).toHaveProperty("where");
        expect(mockedPrismaCalls).toHaveProperty("data");
        expect((mockedPrismaCalls as any).where).toHaveProperty("user_id");
        expect((mockedPrismaCalls as any).where.user_id).toBe("dummyId");

        expect((mockedPrismaCalls as any).data).toHaveProperty("email");
        expect((mockedPrismaCalls as any).data).toHaveProperty("password");
        expect((mockedPrismaCalls as any).data.email).toBe("newEmail");
        expect((mockedPrismaCalls as any).data.password).toBe("newPassword");
    });

    it("repository.updateUser should map null fields to undefined to prevent unintended database overwrites", async () => {
        mockPrismaReturnUser(mockedPrisma.users.update);
        await repoInstance.updateUser(createUpdateUserDto(request, true));
        let mockedPrismaCalls = mockedPrisma.users.update.mock.calls[0][0];
        expect((mockedPrismaCalls as any).data).toHaveProperty("email");
        expect((mockedPrismaCalls as any).data.email).toBe(undefined);
    });

    it("repository.updateUser should return user entity on success", async () => {
        mockPrismaReturnUser(mockedPrisma.users.update);
        let user = await repoInstance.updateUser(
            createUpdateUserDto(request, false),
        );
        expect(user).toBeInstanceOf(UserEntity);
    });

    it("repository.updateUser should throw a mapped error when Prisma fail ", async () => {
        try {
            mockPrismaResolveError(mockedPrisma.users.update);
            await repoInstance.updateUser(createUpdateUserDto(request, false));
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });
});
