import { createJwtServiceFakes } from "../../../__mocks__/jwtService.mock";
import { createBcryptServiceFakes } from "../../../__mocks__/bcryptService.test-utils";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.test-utils";
import { createProfileRepositoryMock } from "../../../__mocks__/profileRepository.test-utils";
import { createUpdateUserDto, createGetByUserDto, createDeleteUserDto } from "../../../__mocks__/request.dto.mock";
import { testHaveProperties } from "../../../__helper__/mockHelper";
import { UserService } from "../../../../src/features/v1/user";
import { UserEntity } from "../../../../src/features/v1/user";
import { IUserEntity } from "../../../../src/features/v1/user/types";
import { ClientError } from "../../../../src/core/error/exceptions";
import {
    createMockPrisma,
    createNewCustomUserDb,
    mk_prismaUserMethod,
    mk_prismaProfileMethod,
} from "../../../__mocks__/prisma.test-utils";
import { jest } from "@jest/globals";

const mockedPrisma = createMockPrisma();

const mockedPrismaUserTable = mk_prismaUserMethod(mockedPrisma);
const mockedPrismaProfileTable = mk_prismaProfileMethod(mockedPrisma);

describe("UserService unit test suite", () => {
    let jwtServiceFakes = createJwtServiceFakes();
    let bcryptServiceFakes = createBcryptServiceFakes();

    let userRepositoryMock = createUserRepositoryMock(mockedPrisma);
    let profileRepositoryMock = createProfileRepositoryMock(mockedPrisma);
    let userService: UserService;

    function createNewUserEntity(): IUserEntity {
        return new UserEntity({
            user_id: "dummyUser",
            email: "dummyUserEmail",
            password: "dummyUserPassword",
            created_at: new Date(),
            updated_at: new Date(),
            role: "GUEST",
        });
    }

    beforeAll(() => {
        userService = new UserService({
            userRepository: userRepositoryMock,
            profileRepository: profileRepositoryMock,
            bcryptService: bcryptServiceFakes,
            jwtService: jwtServiceFakes,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("update()", () => {
        let updateDto = createUpdateUserDto(false);
        let updateDtoHaveNull = createUpdateUserDto(true);
        beforeEach(() => {
            //mockUpdatePrisma.mockResolvedValue(createDefaultUserDb());
            mockedPrismaUserTable.update.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaUserTable.update.executeClearMock();
            updateDto = createUpdateUserDto(false);
            updateDtoHaveNull = createUpdateUserDto(true);
        });

        it("Should call user repository with user_id and new email", async () => {
            const testUserDto = updateDto;
            await userService.update(testUserDto);
            expect(mockedPrismaUserTable.update.getCalls().where.user_id).toEqual(testUserDto.token.id);
            expect(mockedPrismaUserTable.update.getCalls().data.email).toEqual(testUserDto.data.email);
        });

        it("Should use encryption strategy for the new password", async () => {
            const passwordBeforeEncryption = updateDto.data.password;
            await userService.update(updateDto);
            const passwordIsvalid = await bcryptServiceFakes.comparePassword(
                passwordBeforeEncryption as string,
                mockedPrismaUserTable.update.getCalls().data.password,
            );
            expect(passwordIsvalid).toBeTruthy();
        });

        it("Should return valid jsonWebToken", async () => {
            const jwtToken = await userService.update(updateDto);
            const tokenReturnJwtInfo = jwtServiceFakes.validateJwtToken(jwtToken);
            testHaveProperties(tokenReturnJwtInfo, ["email", "role", "id", "iat", "exp"]);
        });

        it("Should convert null email and password into undefined when calling userRepository.update", async () => {
            await userService.update(updateDtoHaveNull);
            expect(mockedPrismaUserTable.update.getCalls().data.email).toBeUndefined();
            expect(mockedPrismaUserTable.update.getCalls().data.password).toBeUndefined();
        });
    });

    describe("create()", () => {
        let newUserCreateInfo = {
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        };
        beforeAll(() => {
            mockedPrismaProfileTable.upsert.declareMockResolvedValue();
            mockedPrismaUserTable.create.declareMockResolvedValue();
        });
        afterEach(() => {
            mockedPrismaProfileTable.upsert.executeClearMock();
            mockedPrismaUserTable.create.executeClearMock();
        });

        it("Should call userRepository.create function with the correct email and crypted password", async () => {
            mockedPrismaUserTable.create.setCustomResolvedvalue(
                createNewCustomUserDb(newUserCreateInfo.email, newUserCreateInfo.password),
            );
            await userService.create(newUserCreateInfo);
            expect(mockedPrisma.users.create).toHaveBeenCalled();
            expect(mockedPrismaUserTable.create.getCalls().data.email).toBe(newUserCreateInfo.email);
            expect(mockedPrismaUserTable.create.getCalls().data.password).toBe(newUserCreateInfo.password);
            testHaveProperties(mockedPrismaUserTable.create.getCalls().data, ["email", "password"]);
            expect(
                bcryptServiceFakes.comparePassword(
                    mockedPrismaUserTable.create.getCalls().data.password,
                    newUserCreateInfo.password,
                ),
            ).toBeTruthy();
        });

        it("Should call jwtService and return the new jwt token that was generated", async () => {
            let token = await userService.create(newUserCreateInfo);
            const tokenReturnJwtInfo = jwtServiceFakes.validateJwtToken(token);
            testHaveProperties(tokenReturnJwtInfo, ["email", "role", "id", "iat", "exp"]);
        });

        it("Should call profileRepository.save with user_id parameter", async () => {
            await userService.create(newUserCreateInfo);
            expect(mockedPrismaProfileTable.upsert.declareMockResolvedValue()).toHaveBeenCalled();

            // test if the profileRepository save is called with the correct id
            expect(mockedPrismaUserTable.create.getCurrentResolvedValue().user_id).toBe(
                (mockedPrismaProfileTable.upsert.getCalls() as any).where.user_id,
            );
        });
    });

    describe("delete()", () => {
        const email = "dummyEmail";
        const id = "dummyId";
        const role = "dummyRole";

        const deleteUserDto = createDeleteUserDto({
            email: email,
            id: id,
            role: role,
        });

        afterEach(() => {
            mockedPrismaUserTable.delete.executeClearMock();
            mockedPrismaProfileTable.delete.executeClearMock();
        });

        it("Should call userRepository.delete with the correct data", async () => {
            await userService.delete(deleteUserDto);
            expect(mockedPrisma.users.delete).toHaveBeenCalled();
            expect(mockedPrismaUserTable.delete.getCalls().where.user_id).toBe(id);
            expect(mockedPrismaUserTable.delete.getCalls().where.email).toBe(email);
        });

        it("Should call profileRepository.delete with correct data", async () => {
            await userService.delete(deleteUserDto);
            expect(mockedPrisma.profiles.delete).toHaveBeenCalled();
            expect(mockedPrismaProfileTable.delete.getCalls().where.user_id).toBe(id);
        });
    });

    describe("findUser()", () => {
        const dummyEmailToFind = "dummyEmailToFind";
        let getUserDto = createGetByUserDto({
            email: dummyEmailToFind,
            authorizedUser: {
                email: "dummyEmail",
                role: "dummyRole",
                id: "dummyId",
            },
        });

        beforeEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.declareMockResolvedValue();
        });

        afterEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should call userRepository.getByEmail with the correct data", async () => {
            await userService.findUser(getUserDto);
            testHaveProperties(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where, ["email"]);
            expect(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where.email).toBe(dummyEmailToFind);
        });

        it("Should return value that produced by userRepository.getByEmail", async () => {
            let user = await userService.findUser(getUserDto);
            let expectedUserEntity = new UserEntity(mockedPrismaUserTable.findUniqueOrThrow.getCurrentResolvedValue());
            expect(user).toEqual(expectedUserEntity);
        });
    });

    describe("compare()", () => {
        const userLoginInfo = {
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        };
        const userLoginInfoWrongPassword = {
            email: "dummyUserEmail",
            password: "wrong password",
        };
        let hashedPassword: string;

        beforeEach(async () => {
            hashedPassword = await bcryptServiceFakes.hashPassword(userLoginInfo.password);
            mockedPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                user_id: "dummyUser",
                email: "dummyUserEmail",
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
                role: "GUEST",
            });
        });

        afterEach(() => {
            mockedPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should calls userRepository get User by email with the correct data", async () => {
            await userService.compare(userLoginInfo);
            expect(mockedPrismaUserTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            testHaveProperties(mockedPrismaUserTable.findUniqueOrThrow.getCalls().where, ["email"]);
        });

        it("Should throw clientError when password incorrect fails", async () => {
            await expect(userService.compare(userLoginInfoWrongPassword)).rejects.toThrow(ClientError);
        });

        it("Should use jwtService to generate token and return it", async () => {
            const token = await userService.compare(userLoginInfo);
            const tokenReturnJwtInfo = jwtServiceFakes.validateJwtToken(token);
            testHaveProperties(tokenReturnJwtInfo, ["email", "role", "id", "iat", "exp"]);
        });
    });
});
