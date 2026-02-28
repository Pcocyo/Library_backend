import {
    createJwtServiceMock,
    jwtServiceMock_generateTokenReturn,
} from "../../../__mocks__/jwtService.mock";
import {
    createBcryptServiceMock,
    bcryptServiceMock_hashFnReturnValue,
} from "../../../__mocks__/bcryptService.mock";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.mock";
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
import { afterEach, beforeEach } from "node:test";

describe("UserService unit test suite", () => {
    let jwtServiceMock = createJwtServiceMock();
    let bcryptServiceMock = createBcryptServiceMock();

    let userRepositoryMock = createUserRepositoryMock();
    let mockRepo_DeleteUser: jest.Mock = userRepositoryMock.delete as jest.Mock;
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
    let userEntityReturned = createNewUserEntity();

    beforeAll(() => {
        userService = new UserService({
            userRepository: userRepositoryMock,
            bcryptService: bcryptServiceMock,
            jwtService: jwtServiceMock,
        });
    });

    //beforeEach(() => {
    //    mockRepo_GetUserByEmail.mockResolvedValue(createNewUserEntity());
    //});
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("update()", () => {
        let mockRepo_UpdateUser: jest.Mock =
            userRepositoryMock.update as jest.Mock;
        beforeAll(() => {
            mockRepo_UpdateUser.mockResolvedValue(createNewUserEntity());
        });
        afterEach(() => {
            mockRepo_UpdateUser.mockClear();
        });

        it("Should call user repository with correct data", async () => {
            const testUserDto = createUpdateUserDto(false);
            await userService.update(testUserDto);
            const updateMockCalls = getMockCalls(mockRepo_UpdateUser);
            expect(userRepositoryMock.update).toHaveBeenCalled();
            expect(updateMockCalls.user_id).toEqual(testUserDto.token.id);
            expect(updateMockCalls.email).toEqual(testUserDto.data.email);
            expect(updateMockCalls.password).toEqual(testUserDto.data.password);
        });

        it("Should call bcryptService hashPassword and use it in the userRepository", async () => {
            await userService.update(createUpdateUserDto(false));
            const updateMockCalls = getMockCalls(mockRepo_UpdateUser);
            expect(bcryptServiceMock.hashPassword).toHaveBeenCalled();
            expect(updateMockCalls.password).toBe(
                bcryptServiceMock_hashFnReturnValue,
            );
        });

        it("Should call generateJwtToken() with the correct data and return it", async () => {
            const jwtToken = await userService.update(
                createUpdateUserDto(false),
            );
            const generateJwtTokenCall = getMockCalls(
                jwtServiceMock.generateJwtToken as jest.Mock,
            );
            expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
            testHaveProperties(generateJwtTokenCall, ["email", "id", "role"]);
            expect(generateJwtTokenCall.email).toBe(
                userEntityReturned.getEmail(),
            );
            expect(generateJwtTokenCall.id).toBe(userEntityReturned.getId());
            expect(generateJwtTokenCall.role).toBe(
                userEntityReturned.getRole(),
            );
            expect(jwtToken).toBe(jwtServiceMock_generateTokenReturn);
        });

        it("Should convert null email and password into undefined when calling userRepository.update", () => {
            userService.update(createUpdateUserDto(true));
            const updateMockCall = getMockCalls(mockRepo_UpdateUser);
            expect(updateMockCall.email).toBeUndefined();
            expect(updateMockCall.password).toBeUndefined();
        });
    });
    describe("create()", () => {
        let mockRepo_CreateUser: jest.Mock =
            userRepositoryMock.create as jest.Mock;
        let newUserCreateInfo = {
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        };
        beforeAll(() => {
            mockRepo_CreateUser.mockResolvedValue(createNewUserEntity());
        });
        afterEach(() => {
            mockRepo_CreateUser.mockClear();
        });

        it("Should call bcryptService.crypt password", async () => {
            await userService.create(newUserCreateInfo);
            expect(bcryptServiceMock.hashPassword).toHaveBeenCalled();
        });

        it("Should call userRepository.create function with the correct email and crypted password", async () => {
            await userService.create(newUserCreateInfo);
            const repo_createMockCall = getMockCalls(mockRepo_CreateUser);
            expect(mockRepo_CreateUser).toHaveBeenCalled();
            testHaveProperties(repo_createMockCall, ["email", "password"]);
            expect(repo_createMockCall.email).toBe(newUserCreateInfo.email);
            expect(mockRepo_CreateUser.mock.calls[0][0].password).toBe(
                bcryptServiceMock_hashFnReturnValue,
            );
        });

        it("Should call jwtSerivice and return the new jwt token that was generated", async () => {
            let token = await userService.create(newUserCreateInfo);
            expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
            expect(token).toBe(jwtServiceMock_generateTokenReturn);
        });

        // create new user profile holder
        //it("userService.create should return generate new jwt token and return it", async () => {
        //    let generatedJwtToken = await userService.create({
        //        email: "dummyUserEmail",
        //        password: "dummyUserPassword",
        //    });
        //});
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
        beforeAll(() => {
            mockRepo_DeleteUser.mockResolvedValue(null);
        });
        it("Should call userRepository.delete with the correct data", async () => {
            await userService.delete(deleteUserDto);
            const repo_deleteCalls = getMockCalls(mockRepo_DeleteUser);
            expect(mockRepo_DeleteUser).toHaveBeenCalled();
            testHaveProperties(repo_deleteCalls, ["email", "user_id"]);
            expect(repo_deleteCalls.email).toBe(email);
            expect(repo_deleteCalls.user_id).toBe(id);
        });

        //delete user profile holder

        //it("userService.delete calls userRepository.deleteUser", async () => {
        //  await userService.delete(createDeleteUserDto({email:"dummyEmail",id:"dummyId",role:"dummyRole"}));
        //  expect(mockRepo_DeleteUser).toHaveBeenCalled();
        //})
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
            email: "dummyEmail",
            password: "dummyPassword",
        };
        const repo_getByEmailReturnValue = createNewUserEntity();
        let mockRepo_getUserByEmail: jest.Mock =
            userRepositoryMock.getByEmail as jest.Mock;

        beforeAll(() => {
            mockRepo_getUserByEmail.mockResolvedValue(
                repo_getByEmailReturnValue,
            );
           (bcryptServiceMock.comparePassword as jest.Mock).mockResolvedValue(true);
        });

        afterAll(() => {
            mockRepo_getUserByEmail.mockReset();
           (bcryptServiceMock.comparePassword as jest.Mock).mockReset();
        });

        it("userService.compare calls userRepository get User by email with the correct data", async () => {
            await userService.compare(userLoginInfo);
            const repo_getByEmailCalls = getMockCalls(mockRepo_getUserByEmail);
            expect(mockRepo_getUserByEmail).toHaveBeenCalled();
            testHaveProperties(repo_getByEmailCalls,["email"])
        });

        it("userService.compare should use bcryptService compare method", async () => {
           await userService.compare(userLoginInfo);
           expect(bcryptServiceMock.comparePassword).toHaveBeenCalled();
        });

        it("userService.compare should throw clientError when brcrypt comapare return false", async () => {
           (bcryptServiceMock.comparePassword as jest.Mock).mockReset();
           (bcryptServiceMock.comparePassword as jest.Mock).mockResolvedValue(false);
           await expect(userService.compare(userLoginInfo)).rejects.toThrow(ClientError);
           (bcryptServiceMock.comparePassword as jest.Mock).mockReset();
           (bcryptServiceMock.comparePassword as jest.Mock).mockResolvedValue(true);
        });

        it("userService.compare user jwtTokenService to generate token and return it", async () => {
            const token = await userService.compare(userLoginInfo);
            expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
            expect(token).toBe(jwtServiceMock_generateTokenReturn);
        });
    });
});
