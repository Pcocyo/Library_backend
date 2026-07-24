import { UserRepository, UserEntity } from "../../../../src/features/v1/user";
import { createMockPrisma, mk_prismaUserMethod } from "../../../__mocks__/prisma.test-utils";
import { Request } from "express";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";
import { getMockCalls, testHaveProperties } from "../../../__helper__/mockHelper";
import { UserRole } from "../../../../src/features/v1/user/types";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((error) => error),
        }),
    },
}));

const mockedPrisma = createMockPrisma();
const mockedPrismaUserTable = mk_prismaUserMethod(mockedPrisma);

describe("User Repository Unit Test Suite", () => {
    let mockedMapError: jest.Mock = ErrorMapperGroup.getInstance().mapError as jest.Mock;
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
        repoInstance = new UserRepository(mockedPrisma);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    // helper function
    async function isUserEntity(parameter: any) {
        expect(parameter).toBeInstanceOf(UserEntity);
    }

    describe("create()", () => {
        //repository create user tests

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

        beforeEach(() => {
            mockedPrismaUserTable.create.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaUserTable.create.executeClearMock();
        });

        it("Should call prisma.user.create with correct data", async () => {
            await repoInstanceCreateNew(false);
            expect(mockedPrismaUserTable.create.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaUserTable.create.getCalls(), ["data"]);
            testHaveProperties(mockedPrismaUserTable.create.getCalls().data, ["email", "password"]);
        });

        it("Should return a UserEntity when succesfully persisted", async () => {
            let user = await repoInstanceCreateNew(true);
            expect(user).toBeInstanceOf(UserEntity);
        });

        it("Should throw a mapped error when Prisma fails", async () => {
            mockedPrismaUserTable.create.setMockResolveError("prisma error");
            await expect(repoInstanceCreateNew(true)).rejects.toThrow();
            expect(mockedMapError).toHaveBeenCalled();
            expect(getMockCalls(mockedMapError).message).toBe("prisma error");
        });
    });

    // repository get by email test
    describe("getByEmail()", () => {
        async function repoInstanceGetByEmail(includeReturn: boolean): Promise<any> {
            if (includeReturn)
                return await repoInstance.getByEmail({
                    email: defaultEmailHolder,
                });
            else
                await repoInstance.getByEmail({
                    email: defaultEmailHolder,
                });
        }

        beforeEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should call prisma.user.findUniqueOrThrow with the correct data", async () => {
            repoInstanceGetByEmail(false);
            expect(mockedPrismaUserTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaUserTable.findUniqueOrThrow.getCalls(), ["where"]);
            testHaveProperties(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where, ["email"]);
            expect(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where.email).toBe(defaultEmailHolder);
        });

        it("Should return a User entity when a record exists", async () => {
            let user = await repoInstanceGetByEmail(true);
            expect(isUserEntity(user)).toBeTruthy;
        });

        it("Should throw a mapped error when Prisma fail", async () => {
            mockedPrismaUserTable.findUniqueOrThrow.setMockResolveError("prisma error");
            await expect(repoInstanceGetByEmail(true)).rejects.toThrow();
            expect(mockedMapError).toHaveBeenCalled();
            expect(getMockCalls(mockedMapError).message).toBe("prisma error");
        });
    });

    // repository delete user test
    describe("delete()", () => {
        async function repoInstanceDelete(): Promise<any> {
            return await repoInstance.delete({
                email: defaultEmailHolder,
                user_id: defaultIdHolder,
            });
        }

        beforeEach(() => {
            mockedPrismaUserTable.delete.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaUserTable.delete.executeClearMock();
        });

        it("Should call prisma.user.delete with the correct data", async () => {
            await repoInstanceDelete();
            expect(mockedPrismaUserTable.delete.getMockfn()).toHaveBeenCalled();
            expect(mockedPrismaUserTable.delete.getCalls()).toHaveProperty("where");
            testHaveProperties(mockedPrismaUserTable.delete.getCalls().where, ["email", "user_id"]);
            expect(mockedPrismaUserTable.delete.getCalls().where.email).toBe(defaultEmailHolder);
            expect(mockedPrismaUserTable.delete.getCalls().where.user_id).toBe(defaultIdHolder);
        });

        it("Should dalegate into mapped error when Prisma fail", async () => {
            mockedPrismaUserTable.delete.setMockResolveError("prisma error");
            await expect(repoInstanceDelete()).rejects.toThrow();
            expect(mockedMapError).toHaveBeenCalled();
            expect(getMockCalls(mockedMapError).message).toBe("prisma error");
        });
    });

    describe("update()", () => {
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

        beforeEach(() => {
            mockedPrismaUserTable.update.declareMockResolvedValue();
        });

        afterEach(() => {
            mockedPrismaUserTable.update.executeClearMock();
        });

        it("repository.updateUser should call prisma.users.update with the correct data", async () => {
            repoInstanceUpdate(false);
            expect(mockedPrismaUserTable.update.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaUserTable.update.getCalls(), ["where", "data"]);
            testHaveProperties(mockedPrismaUserTable.update.getCalls().where, ["user_id"]);
            testHaveProperties(mockedPrismaUserTable.update.getCalls().data, ["email", "password", "role"]);
            expect(mockedPrismaUserTable.update.getCalls().data.email).toBe(defaultEmailHolder);
            expect(mockedPrismaUserTable.update.getCalls().data.password).toBe(defaultPasswordHolder);
            expect(mockedPrismaUserTable.update.getCalls().data.role).toBe(defaultRoleHolder);
        });

        it("repository.updateUser should return user entity on success", async () => {
            let user = await repoInstanceUpdate(true);
            isUserEntity(user);
        });

        it("repository.updateUser should throw a mapped error when Prisma fail ", async () => {
            mockedPrismaUserTable.update.setMockResolveError("prisma error");
            await expect(repoInstanceUpdate(false)).rejects.toThrow();
            expect(mockedMapError).toHaveBeenCalled();
            expect(getMockCalls(mockedMapError).message).toBe("prisma error");
        });
    });

    describe("save()", () => {
        const data = {
            email: "dummyEmail",
            role: "MEMBER",
            updatedAt: new Date("2022-02-01"),
            password: "test",
        };
        beforeEach(() => {
            mockedPrismaUserTable.upsert.declareMockResolvedValue();
        });

        afterEach(() => {
            mockedPrismaUserTable.upsert.executeClearMock();
        });

        it.only("repository.save should call prisma.users.upsert with the correct data", async () => {
            await repoInstance.save({
                email: data.email,
                role: data.role as UserRole,
                updatedAt: data.updatedAt,
                password: data.password,
            });
            expect(mockedPrismaUserTable.upsert.getMockfn()).toHaveBeenCalled();
            expect(mockedPrismaUserTable.upsert.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaUserTable.upsert.getCalls(), ["where", "update", "create"]);
            testHaveProperties(mockedPrismaUserTable.upsert.getCalls().where, ["email"]);
            testHaveProperties(mockedPrismaUserTable.upsert.getCalls().update, ["role", "updated_at", "password"]);
            testHaveProperties(mockedPrismaUserTable.upsert.getCalls().create, [
                "email",
                "role",
                "updated_at",
                "password",
            ]);

            expect(mockedPrismaUserTable.upsert.getCalls().where.email).toEqual(data.email);

            expect(mockedPrismaUserTable.upsert.getCalls().update.role).toEqual(data.role);
            expect(mockedPrismaUserTable.upsert.getCalls().update.updated_at).toEqual(data.updatedAt);
            expect(mockedPrismaUserTable.upsert.getCalls().update.password).toEqual(data.password);

            expect(mockedPrismaUserTable.upsert.getCalls().create.role).toEqual(data.role);
            expect(mockedPrismaUserTable.upsert.getCalls().create.password).toEqual(data.password);
            expect(mockedPrismaUserTable.upsert.getCalls().create.email).toEqual(data.email);
           
        });

        it("repository.save should call prisma.users.upsert with the correct data", async () => {
            mockedPrismaUserTable.upsert.setMockResolveError("error");
            await expect(
               repoInstance.save({
                    email: data.email,
                    role: data.role as UserRole,
                    updatedAt: data.updatedAt,
                    password: data.password,
                }),
            ).rejects.toThrow();
            expect(mockedMapError).toHaveBeenCalled();
            expect(getMockCalls(mockedMapError).message).toBe("error");
        });
    });
});
////repository update user test
