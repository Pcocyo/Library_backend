import { createJwtServiceFakes } from "../../../__mocks__/jwtService.mock";
import { createBcryptServiceFakes } from "../../../__mocks__/bcryptService.mock";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.mock";
import { createProfileRepositoryMock } from "../../../__mocks__/profileRepository.mock";
import {
    createUpdateUserDto,
    createGetByUserDto,
    createDeleteUserDto,
} from "../../../__mocks__/request.dto.mock";
import {
    getMockCalls,
    testHaveProperties,
} from "../../../__helper__/mockHelper";
import { UserService } from "../../../../src/features/v1/user";
import { UserEntity } from "../../../../src/features/v1/user";
import { IUserEntity } from "../../../../src/features/v1/user/types";
import { ClientError } from "../../../../src/core/error/exceptions";
import { afterEach } from "node:test";
describe("UserService unit test suite", () => {
    let jwtServiceFakes = createJwtServiceFakes();
    let bcryptServiceFakes = createBcryptServiceFakes();

    let userRepositoryMock = createUserRepositoryMock();
    let profileRepositoryMock = createProfileRepositoryMock();
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
        let mockRepo_UpdateUser: jest.Mock =
            userRepositoryMock.update as jest.Mock;
        let updateDto = createUpdateUserDto(false);
        let updateDtoHaveNull = createUpdateUserDto(true);
        beforeAll(() => {
            mockRepo_UpdateUser.mockResolvedValue(createNewUserEntity());
        });
        afterEach(() => {
            mockRepo_UpdateUser.mockClear();
            updateDto = createUpdateUserDto(false);
            updateDtoHaveNull = createUpdateUserDto(true);
        });

        it("Should call user repository with correct data", async () => {
            const testUserDto = updateDto;
            await userService.update(testUserDto);
            const updateMockCalls = getMockCalls(mockRepo_UpdateUser);
            expect(userRepositoryMock.update).toHaveBeenCalled();
            expect(updateMockCalls.user_id).toEqual(testUserDto.token.id);
            expect(updateMockCalls.email).toEqual(testUserDto.data.email);
            expect(updateMockCalls.password).toEqual(testUserDto.data.password);
        });

        it("Should call bcryptService hashPassword and use it in the userRepository", async () => {
            await userService.update(updateDto);
            const updateMockCalls = getMockCalls(mockRepo_UpdateUser);
            expect(
                bcryptServiceFakes.comparePassword(
                    updateMockCalls.password,
                    updateDto.data.password as string,
                ),
            ).toBeTruthy();
        });

        it("Should call generateJwtToken() with the correct data and return it", async () => {
            const jwtToken = await userService.update(updateDto);
            const tokenReturnJwtInfo =
                jwtServiceFakes.validateJwtToken(jwtToken);
            testHaveProperties(tokenReturnJwtInfo, [
                "email",
                "role",
                "id",
                "iat",
                "exp",
            ]);
        });

        it("Should convert null email and password into undefined when calling userRepository.update", () => {
            userService.update(updateDtoHaveNull);
            const updateMockCall = getMockCalls(mockRepo_UpdateUser);
            expect(updateMockCall.email).toBeUndefined();
            expect(updateMockCall.password).toBeUndefined();
        });
    });
    describe("create()", () => {
        let mockRepo_CreateUser: jest.Mock =
            userRepositoryMock.create as jest.Mock;
        let mockRepo_SaveProfile: jest.Mock =
            profileRepositoryMock.save as jest.Mock;
        let newUserCreateInfo = {
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        };
        let mockCreateUserReturnVal = createNewUserEntity();
        beforeAll(() => {
            mockRepo_CreateUser.mockResolvedValue(mockCreateUserReturnVal);
            mockRepo_SaveProfile.mockResolvedValue({ data: "test" });
        });
        afterEach(() => {
            mockRepo_CreateUser.mockClear();
            mockRepo_SaveProfile.mockClear();
        });

        it("Should call userRepository.create function with the correct email and crypted password", async () => {
            await userService.create({ ...newUserCreateInfo });
            const repo_createMockCall = getMockCalls(mockRepo_CreateUser);
            expect(mockRepo_CreateUser).toHaveBeenCalled();
            testHaveProperties(repo_createMockCall, ["email", "password"]);
            expect(repo_createMockCall.email).toBe(newUserCreateInfo.email);
            expect(
                bcryptServiceFakes.comparePassword(
                    repo_createMockCall.password,
                    newUserCreateInfo.password,
                ),
            ).toBeTruthy();
        });

        it("Should call jwtSerivice and return the new jwt token that was generated", async () => {
            let token = await userService.create(newUserCreateInfo);
            const tokenReturnJwtInfo = jwtServiceFakes.validateJwtToken(token);
            testHaveProperties(tokenReturnJwtInfo, [
                "email",
                "role",
                "id",
                "iat",
                "exp",
            ]);
        });

        it("Should call profileRepository.save with user_id parameter", async () => {
            await userService.create(newUserCreateInfo);
            expect(mockRepo_SaveProfile).toHaveBeenCalled();
            const repo_saveProfileCall = getMockCalls(mockRepo_SaveProfile);
            testHaveProperties(repo_saveProfileCall, ["user_id"]);
            expect(repo_saveProfileCall.user_id).toBe(
                mockCreateUserReturnVal.getId(),
            );
        });
    });
    describe("delete()", () => {
        const email = "dummyEmail";
        const id = "dummyId";
        const role = "dummyRole";

        let mockRepo_DeleteUser: jest.Mock =
            userRepositoryMock.delete as jest.Mock;
        let mockRepo_DeleteProfile: jest.Mock =
            profileRepositoryMock.delete as jest.Mock;
        const deleteUserDto = createDeleteUserDto({
            email: email,
            id: id,
            role: role,
        });
        beforeAll(() => {
            mockRepo_DeleteUser.mockResolvedValue(null);
            mockRepo_DeleteProfile.mockResolvedValue(null);
        });
        it("Should call userRepository.delete with the correct data", async () => {
            await userService.delete(deleteUserDto);
            const repo_deleteCalls = getMockCalls(mockRepo_DeleteUser);
            expect(mockRepo_DeleteUser).toHaveBeenCalled();
            testHaveProperties(repo_deleteCalls, ["email", "user_id"]);
            expect(repo_deleteCalls.email).toBe(email);
            expect(repo_deleteCalls.user_id).toBe(id);
        });

        it("Should call profileRepository.delete with correct data", async () => {
            await userService.delete(deleteUserDto);
            expect(mockRepo_DeleteProfile).toHaveBeenCalled();
            const repo_deleteProfileCalls = getMockCalls(mockRepo_DeleteProfile);
            testHaveProperties(repo_deleteProfileCalls,["user_id"])
            expect(repo_deleteProfileCalls.user_id).toBe(deleteUserDto.token.id);
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
        const repo_getByEmailReturnValue = createNewUserEntity();
        let mockRepo_getUserByEmail: jest.Mock =
            userRepositoryMock.getByEmail as jest.Mock;

        beforeAll(() => {
            mockRepo_getUserByEmail.mockResolvedValue(
                repo_getByEmailReturnValue,
            );
        });
        afterAll(() => {
            mockRepo_getUserByEmail.mockReset();
        });

        it("Should call userRepository.getByEmail with the correct data", async () => {
            await userService.findUser(getUserDto);
            const repo_getUserByEmailCalls = getMockCalls(
                mockRepo_getUserByEmail,
            );
            expect(mockRepo_getUserByEmail).toHaveBeenCalled();
            testHaveProperties(repo_getUserByEmailCalls, ["email"]);
            expect(repo_getUserByEmailCalls.email).toBe(dummyEmailToFind);
        });

        it("Should return value that produced by userRepository.getByEmail", async () => {
            let user = await userService.findUser(getUserDto);
            expect(user).toEqual(repo_getByEmailReturnValue);
        });
    });

    describe("compare()", () => {
        const userLoginInfo = {
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        };
        const userLoginInfoWrongPassword = {
            email: "dummyEmail",
            password: "wrong password",
        };
        let hashedPassword: string;

        let repo_getByEmailReturnValue: UserEntity;
        let mockRepo_getUserByEmail: jest.Mock =
            userRepositoryMock.getByEmail as jest.Mock;

        beforeAll(async () => {
            hashedPassword = await bcryptServiceFakes.hashPassword(
                userLoginInfo.password,
            );

            repo_getByEmailReturnValue = new UserEntity({
                user_id: "dummyUser",
                email: "dummyUserEmail",
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
                role: "GUEST",
            });

            mockRepo_getUserByEmail.mockResolvedValue(
                repo_getByEmailReturnValue,
            );
        });

        afterAll(() => {
            mockRepo_getUserByEmail.mockReset();
        });

        it("Should calls userRepository get User by email with the correct data", async () => {
            await userService.compare(userLoginInfo);
            const repo_getByEmailCalls = getMockCalls(mockRepo_getUserByEmail);
            expect(mockRepo_getUserByEmail).toHaveBeenCalled();
            testHaveProperties(repo_getByEmailCalls, ["email"]);
        });

        it("Should use bcryptService compare method and returns on sucess", async () => {
            let user = await userService.compare(userLoginInfo);
            expect(user).not.toBeNull();
            expect(user).not.toBeUndefined();
        });

        it("Should throw clientError when brcrypt compare fails", async () => {
            await expect(
                userService.compare(userLoginInfoWrongPassword),
            ).rejects.toThrow(ClientError);
        });

        it("Should use jwtService to generate token and return it", async () => {
            const token = await userService.compare(userLoginInfo);
            const tokenReturnJwtInfo = jwtServiceFakes.validateJwtToken(token);
            testHaveProperties(tokenReturnJwtInfo, [
                "email",
                "role",
                "id",
                "iat",
                "exp",
            ]);
        });
    });
});
