import {
    createJwtServiceMock,
    jwtServiceMock_generateTokenReturn,
} from "../../../__mocks__/jwtService.mock";
import { createBcryptServiceMock } from "../../../__mocks__/bcryptService.mock";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.mock";
import {
    createUpdateUserDto,
    createGetByUserDto,
    createDeleteUserDto,
} from "../../../__mocks__/request.dto.mock";
import { UserService } from "../../../../src/features/v1/user";
import {
    DeleteUserDto,
    GetUserDto,
    UpdateUserDto,
    LoginUserDto,
} from "../../../../src/features/v1/user/dto";
import { UserEntity } from "../../../../src/features/v1/user";
import { IUserEntity } from "../../../../src/features/v1/user/types";
import { ErrorMapperGroup } from "../../../../src/core/error/mappers/ErrorMapperGroup";
import { ClientError } from "../../../../src/core/error/exceptions";

jest.mock("../../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((error) => error),
        }),
    },
}));
describe("user service unit test suite", () => {
    let jwtServiceMock = createJwtServiceMock();
    let bcryptServiceMock = createBcryptServiceMock();
    let mockedMapError: jest.Mock = ErrorMapperGroup.getInstance()
        .mapError as jest.Mock;

    let userRepositoryMock = createUserRepositoryMock();
    let mockRepo_UpdateUser: jest.Mock =
        userRepositoryMock.updateUser as jest.Mock;
    let mockRepo_CreateUser: jest.Mock =
        userRepositoryMock.createNewUser as jest.Mock;
    let mockRepo_DeleteUser: jest.Mock =
        userRepositoryMock.deleteUser as jest.Mock;
    let mockRepo_GetUserByEmail: jest.Mock =
        userRepositoryMock.getUserByEmail as jest.Mock;
    let userService: UserService;

    let getByUserDto = createGetByUserDto({
        email: "dummyEmailToFind",
        authorizedUser: {
            email: "dummyEmail",
            id: "dummyId",
            role: "GUEST",
        },
    });

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
            bcryptService: bcryptServiceMock,
            jwtService: jwtServiceMock,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo_CreateUser.mockResolvedValue(createNewUserEntity());
        mockRepo_UpdateUser.mockResolvedValue(createNewUserEntity());
        mockRepo_DeleteUser.mockResolvedValue(createNewUserEntity());
        mockRepo_GetUserByEmail.mockResolvedValue(createNewUserEntity());
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it("userService.update should call user repository with correct data", async () => {
        await userService.update(createUpdateUserDto(false));
        expect(userRepositoryMock.updateUser).toHaveBeenCalled();
        expect(mockRepo_UpdateUser.mock.calls[0][0]).toBeInstanceOf(
            UpdateUserDto,
        );
    });

    it("userService.update should throw error when repository fail", async () => {
        try {
            await userService.update(createUpdateUserDto(false));
            mockRepo_UpdateUser.mockRejectedValue(
                new Error("repo throw error"),
            );
        } catch (err) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    it("userService.update should call bcryptService hashPassword and use it in the userRepository", async () => {
        await userService.update(createUpdateUserDto(false));
        expect(bcryptServiceMock.hashPassword).toHaveBeenCalled();
        expect(
            (mockRepo_UpdateUser.mock.calls[0][0] as UpdateUserDto).data
                .password,
        ).toBe("hashedPassword");
    });

    it("userService.update should call generateJwtToken() with the correct data and return it", async () => {
        let jwtToken = await userService.update(createUpdateUserDto(false));
        let generateJwtTokenCall = (
            jwtServiceMock.generateJwtToken as jest.Mock
        ).mock.calls[0][0];
        expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
        expect(generateJwtTokenCall).toHaveProperty("email");
        expect(generateJwtTokenCall).toHaveProperty("id");
        expect(generateJwtTokenCall).toHaveProperty("role");
        expect(generateJwtTokenCall.email).toBe("dummyUserEmail");
        expect(generateJwtTokenCall.id).toBe("dummyUser");
        expect(generateJwtTokenCall.role).toBe("GUEST");
        expect(jwtToken).toBe("jwtTokenMock");
    });

    // userService create user
    it("userService.create call userRepository.createUser should call bcryptService. crypt password", async () => {
        await userService.create({
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        });
        expect(bcryptServiceMock.hashPassword).toHaveBeenCalled();
    });

    it("userService.create call userRepository.createUser function with the correct email and crypted password", async () => {
        await userService.create({
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        });
        expect(mockRepo_CreateUser).toHaveBeenCalled();
        expect(mockRepo_CreateUser.mock.calls[0][0]).toHaveProperty("email");
        expect(mockRepo_CreateUser.mock.calls[0][0]).toHaveProperty("password");
        expect(mockRepo_CreateUser.mock.calls[0][0].email).toBe(
            "dummyUserEmail",
        );
        expect(mockRepo_CreateUser.mock.calls[0][0].password).toBe(
            "hashedPassword",
        );
    });

    it("userService.create should return generate new jwt token and return it", async () => {
        let generatedJwtToken = await userService.create({
            email: "dummyUserEmail",
            password: "dummyUserPassword",
        });
        expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
        expect(generatedJwtToken).toBe("jwtTokenMock");
    });

    // create new user profile holder
    //it("userService.create should return generate new jwt token and return it", async () => {
    //    let generatedJwtToken = await userService.create({
    //        email: "dummyUserEmail",
    //        password: "dummyUserPassword",
    //    });
    //});

    it("userService.create throw error if userRepository.createUser failed", async () => {
        try {
            mockRepo_CreateUser.mockRejectedValue(new Error("user repo fail"));
            await userService.create({
                email: "dummyUserEmail",
                password: "dummyUserPassword",
            });
        } catch (error) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    //userService delete
    it("userService.delete calls userRepository.deleteUser", async () => {
        await userService.delete(
            createDeleteUserDto({
                email: "dummyEmail",
                id: "dummyId",
                role: "dummyRole",
            }),
        );
        expect(mockRepo_DeleteUser).toHaveBeenCalled();
        expect(mockRepo_DeleteUser.mock.calls[0][0]).toBeInstanceOf(
            DeleteUserDto,
        );
    });

    it("userService.delete calls error mapper group if any operation failed", async () => {
        try {
            mockRepo_DeleteUser.mockRejectedValue(new Error("test error"));
            await userService.delete(
                createDeleteUserDto({
                    email: "dummyEmail",
                    id: "dummyId",
                    role: "dummyRole",
                }),
            );
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    //delete user profile holder

    //it("userService.delete calls userRepository.deleteUser", async () => {
    //  await userService.delete(createDeleteUserDto({email:"dummyEmail",id:"dummyId",role:"dummyRole"}));
    //  expect(mockRepo_DeleteUser).toHaveBeenCalled();
    //})

    it("userService.findUser calls userRepository.getByUserEmail with the correct data when passed with GetUserDto", async () => {
        await userService.findUser(getByUserDto);
        expect(mockRepo_GetUserByEmail).toHaveBeenCalled();
        expect(mockRepo_GetUserByEmail.mock.calls[0][0]).toBeInstanceOf(
            GetUserDto,
        );
    });

    it("userService.findUser return user entity", async () => {
        let user = await userService.findUser(getByUserDto);
        expect(user).toBeInstanceOf(UserEntity);
    });

    it("userService.findUser calls error mapper group if any operation failed", async () => {
        try {
            mockRepo_GetUserByEmail.mockRejectedValue(new Error("test error"));
            await userService.findUser(getByUserDto);
        } catch (error: unknown) {
            expect(mockedMapError).toHaveBeenCalled();
        }
    });

    // userService compare test suite

    it("userService.compare calls userRepository get User by email with the correct data", async () => {
        await userService.compare({
            email: "dummyEmail",
            password: "dummyPassword",
        });
        let mockRepo_GetUserByEmailCalls =
            mockRepo_GetUserByEmail.mock.calls[0][0];
        expect(mockRepo_GetUserByEmail).toHaveBeenCalled();
        expect(mockRepo_GetUserByEmailCalls).toHaveProperty("email");
        expect(mockRepo_GetUserByEmailCalls).toHaveProperty("password");
        expect(mockRepo_GetUserByEmailCalls.email).toBe("dummyEmail");
        expect(mockRepo_GetUserByEmailCalls.password).toBe("dummyPassword");
    });

    it("userService.compare user jwtTokenService to generate token and return it", async () => {
        let token = await userService.compare({
            email: "dummyEmail",
            password: "dummyPassword",
        });
        expect(jwtServiceMock.generateJwtToken).toHaveBeenCalled();
        expect(token).toBe(jwtServiceMock_generateTokenReturn);
    });

    it("userService.compare should use bcryptService compare method", async () => {
        await userService.compare({
            email: "dummyEmail",
            password: "dummyComparePassword",
        });
        expect(bcryptServiceMock.comparePassword).toHaveBeenCalled();
    });

    it("userService.compare should return throw ClientError when bcrypt compare false", async () => {
        (bcryptServiceMock.comparePassword as jest.Mock).mockResolvedValue(
            false,
        );
        try {
            await userService.compare({
                email: "dummyEmail",
                password: "dummyComparePassword",
            });
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(ClientError);
        }
    });
});
