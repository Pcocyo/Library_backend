// Library imports
import { PrismaClient } from "@prisma/client/extension";
import { NextFunction, Request, Response } from "express";

// Class imports
import { UserController } from "../../../../src/features/v1/user/user.controller";
import { UserService } from "../../../../src/features/v1/user";

// Interface imports
import { IUserController, IUserService, IUserRepository } from "../../../../src/features/v1/user/types";
import { IJwtService } from "../../../../src/core/security/interfaces";
import { IBcryptService } from "../../../../src/core/security/interfaces";

// Test helper imports
import { mk_prismaUserMethod, mk_prismaProfileMethod, createMockPrisma } from "../../../__mocks__/prisma.test-utils";
import { createBcryptServiceFakes } from "../../../__mocks__/bcryptService.test-utils";
import { createJwtServiceFakes } from "../../../__mocks__/jwtService.mock";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.test-utils";
import { createProfileRepositoryMock } from "../../../__mocks__/profileRepository.test-utils";
import { IProfileRepository } from "../../../../src/features/v1/profile/types";
import { getMockCalls, testHaveProperties } from "../../../__helper__/mockHelper";
import { expressHelper } from "../../../__helper__/expressHelper";
import { jwtFakesHelper_fn } from "../../../__helper__/jwtFakesHelper";
import { jest } from "@jest/globals";

const bcryptService: IBcryptService = createBcryptServiceFakes();
const jwtService: IJwtService = createJwtServiceFakes();
const mockPrisma: PrismaClient = createMockPrisma();
const mockPrismaUserTable = mk_prismaUserMethod(mockPrisma);
const mockPrismaProfileTable = mk_prismaProfileMethod(mockPrisma);

describe("UserController unit test suite", () => {
    let userController: IUserController;
    let userService: IUserService;
    const userRepositoryMock: IUserRepository = createUserRepositoryMock(mockPrisma);
    const profileRepositoryMock: IProfileRepository = createProfileRepositoryMock(mockPrisma);

    beforeAll(() => {
        userService = new UserService({
            jwtService: jwtService,
            bcryptService: bcryptService,
            profileRepository: profileRepositoryMock,
            userRepository: userRepositoryMock,
        });
        userController = new UserController(userService);
    });

    describe("updateUser()", () => {
        let updatedEmail = "update email";
        let updatedPassword = "update password";
        let jwtHelper: any;

        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };

        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, {
                email: "dummyEmail",
                role: "GUEST",
                id: "dummyId",
            });
            express = expressHelper({
                authorizedUser: jwtHelper.getDefaultJwtData(),
                email: updatedEmail,
                password: updatedPassword,
            }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaUserTable.update.setCustomResolvedvalue({
                user_id: jwtHelper.getDefaultJwtData().id,
                email: updatedEmail,
                password: updatedPassword,
                role: mockPrismaUserTable.update.getDefaultResolvedValue().role,
                created_at: mockPrismaUserTable.update.getDefaultResolvedValue().created_at,
                updated_at: mockPrismaUserTable.update.getDefaultResolvedValue().updated_at,
            });

            Object.keys(express.response).forEach((key) => {
                ((express.response as any)[key] as jest.Mock).mockClear();
            });
            (express.next as jest.Mock).mockClear();
        });

        afterEach(() => {
            mockPrismaUserTable.update.executeClearMock();
        });

        it("Response with valid jwt token on valid user access", async () => {
            await userController.updateUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            let response = getMockCalls(express.response.send as jest.Mock);
            testHaveProperties(jwtService.validateJwtToken(response.token), ["email", "role", "id", "iat", "exp"]);
        });

        it("Call Stack should reach ProfileRepository.update by calling UserService.UpdateUser", async () => {
            await userController.updateUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaUserTable.update.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaUserTable.update.getCalls().where.user_id).toEqual(jwtHelper.getDefaultJwtData().id);
            expect(mockPrismaUserTable.update.getCalls().data.email).toEqual(updatedEmail);
            expect(
                await bcryptService.comparePassword(
                    updatedPassword,
                    mockPrismaUserTable.update.getCalls().data.password,
                ),
            ).toBeTruthy();
        });
    });

    describe("createUser()", () => {
        const dummyEmail = "new_dummy";
        const dummyPassword = "new_dummy_pws";
        const dummyId = "new_dummy_id";
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        beforeAll(() => {
            express = expressHelper({ email: dummyEmail, password: dummyPassword }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaUserTable.create.setCustomResolvedvalue({
                ...mockPrismaUserTable.create.getDefaultResolvedValue(),
                user_id: dummyId,
                email: dummyEmail,
                password: dummyPassword,
            });
            mockPrismaProfileTable.upsert.setCustomResolvedvalue({
                ...mockPrismaProfileTable.upsert.getDefaultResolvedValue(),
                user_id: dummyId,
            });

            Object.keys(express.response).forEach((key) => {
                ((express.response as any)[key] as jest.Mock).mockClear();
            });
            (express.next as jest.Mock).mockClear();
        });
        afterEach(() => {
            mockPrismaUserTable.create.executeClearMock();
            mockPrismaProfileTable.upsert.executeClearMock();
        });

        it("Should response with valid jwt token", async () => {
            await userController.createUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            const response = getMockCalls(express.response.send as jest.Mock);
            expect(express.response.send).toHaveBeenCalled();
            expect(response).toHaveProperty("token");
            testHaveProperties(jwtService.validateJwtToken(response.token), ["id", "email", "iat", "exp"]);
        });

        it("Should reach userRepository.create call stack ", async () => {
            await userController.createUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            let mockCall = getMockCalls(express.response.send as jest.Mock);

            expect(jwtService.validateJwtToken(mockCall.token).id).toEqual(
                mockPrismaUserTable.create.getCurrentResolvedValue().user_id,
            );
            expect(jwtService.validateJwtToken(mockCall.token).email).toEqual(
                mockPrismaUserTable.create.getCurrentResolvedValue().email,
            );
        });

        it("Should reach profileRepository.save call stack", async () => {
            await userController.createUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaProfileTable.upsert.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.upsert.getCalls().where.user_id).toEqual(dummyId);
        });
    });

    describe("login()", () => {
        let express: {
            request: Partial<Request>;
            response: Partial<Response>;
            next: NextFunction;
        };
        const dummy_login_email = "dummy_login_email";
        const dummy_login_password = "dummy_login_password";
        const dummy_login_id = "dummy_login_id";

        beforeAll(() => {
            express = expressHelper({
                email: dummy_login_email,
                password: dummy_login_password,
            }).declareAllExpressPartials();
        });

        beforeEach(async () => {
            mockPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                ...mockPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue(),
                email: dummy_login_email,
                password: await bcryptService.hashPassword(dummy_login_password),
                user_id: dummy_login_id,
            });

            Object.keys(express.response).forEach((key) => {
                ((express.response as any)[key] as jest.Mock).mockClear();
            });
            (express.next as jest.Mock).mockClear();
        });
        afterEach(() => {
            mockPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should response with valid jwt token", async () => {
            await userController.login(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            const response = getMockCalls(express.response.send as jest.Mock);
            expect(response).toHaveProperty("token");
            expect(jwtService.validateJwtToken(response.token));
            testHaveProperties(jwtService.validateJwtToken(response.token), ["id", "email", "iat", "exp"]);
        });

        it("Should reach userRepository.findUniqueOrThrow call stack", async () => {
            await userController.login(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaUserTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaUserTable.findUniqueOrThrow.getCalls().where.email).toEqual(dummy_login_email);
        });
    });

    describe("getUser()", () => {
        let jwtHelper: any;
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        const request_dummy_email = "request_dummy_email";
        const request_dummy_id = "request_dummy_id";
        const request_dummy_role = "request_dummy_role";
        const email_find = "email_user_want_find";
        const id_find = "id_user_want_find";

        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, {
                email: request_dummy_email,
                role: request_dummy_role,
                id: request_dummy_id,
            });
            express = expressHelper({ email: email_find }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                ...mockPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue(),
                user_id: id_find,
                email: email_find,
            });

            Object.keys(express.response).forEach((key) => {
                ((express.response as any)[key] as jest.Mock).mockClear();
            });

            (express.next as jest.Mock).mockClear();
        });
        afterEach(() => {
            mockPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should reach userRepository.findUniqueOrThrow call stack", async () => {
            await userController.getUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaUserTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
        });

        it("Should respond with valid user entity response", async () => {
            await userController.getUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            const response = getMockCalls(express.response.send as jest.Mock);
            testHaveProperties(response, ["user_id", "email"]);
            expect(response.user_id).toEqual(id_find);
            expect(response.email).toEqual(email_find);
        });
    });

    describe("deleteUser()", () => {
        let jwtHelper: any;
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        let user_id_delete = "dummy-id-delete";
        let user_email_delete = "dummy-email-delete";
        let user_role_delete = "dummy-role-delete";

        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, {
                email: user_email_delete,
                id: user_id_delete,
                role: user_role_delete,
            });
            express = expressHelper({
                authorizedUser: jwtHelper.getDefaultJwtData(),
            }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaUserTable.delete.setCustomResolvedvalue({
                ...mockPrismaUserTable.delete.getDefaultResolvedValue(),
                user_id: user_id_delete,
                email: user_email_delete,
                role: user_role_delete,
            });
            Object.keys(express.response).forEach((e) => {
                ((express.response as any)[e] as jest.Mock).mockClear();
            });
            (express.next as jest.Mock).mockClear();
        });

        afterEach(() => {
            mockPrismaUserTable.delete.executeClearMock();
        });

        it("Should reach userRepository.delete call stack with correct attributes", async () => {
            await userController.deleteUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            const userToDel = mockPrismaUserTable.delete.getCalls();
            expect(userToDel.where.user_id).toEqual(user_id_delete);
            expect(userToDel.where.email).toEqual(user_email_delete);
        });

        it("Should response with a success message", async () => {
            await userController.deleteUser(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(express.response.send as jest.Mock).toHaveBeenCalled();
            expect(getMockCalls(express.response.send as jest.Mock)).toHaveProperty("message");
        });
    });

    describe.only("activate_membership", () => {
        let jwtHelper:any;
        let express: {
         response: Partial<Response>,
         request: Partial<Request>,
         next: NextFunction,
      };
        let user_id_subscribe = "dummy-id-subscribe";
        let user_email_subscribe = "dummy-email-subscribe";
        let user_role_subscribe = "dummy-role-subscribe";
        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, {
                email: user_email_subscribe,
                id: user_id_subscribe,
                role: user_role_subscribe,
            });
            express = expressHelper({
                authorizedUser: jwtHelper.getDefaultJwtData(),
            }).declareAllExpressPartials();
        });
        beforeEach(() => {
            mockPrismaUserTable.update.declareMockResolvedValue();
            mockPrismaUserTable.update.setCustomResolvedvalue({
               ...mockPrismaUserTable.update.getDefaultResolvedValue(),
               user_id: user_id_subscribe,
         });
            mockPrismaProfileTable.upsert.declareMockResolvedValue();
        });

        afterEach(() => {
            mockPrismaUserTable.update.executeClearMock();
            mockPrismaProfileTable.upsert.executeClearMock();
        });

        it("Should respond with new token on success", async() => {
            await userController.activate_membership(express.request as Request, express.response as Response, express.next as NextFunction);
            expect(getMockCalls(express.response.send as jest.Mock)).toHaveProperty("token");
        });
        
        it("Should call userService.activate_membership with correct DTO", async() => {
            await userController.activate_membership(express.request as Request, express.response as Response, express.next as NextFunction);
            expect(mockPrismaUserTable.update.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.upsert.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.upsert.getCalls().where.user_id).toEqual(user_id_subscribe)
            expect(mockPrismaUserTable.update.getCalls().where.user_id).toEqual(user_id_subscribe)
        });
    });
});
