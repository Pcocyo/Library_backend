// Library imports
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Source imports
import { ProfileController } from "../../../../src/features/v1/profile/profile.controller";
import { ProfileService } from "../../../../src/features/v1/profile";
import { IJwtService } from "../../../../src/core/security/interfaces";

// Interface imports
import { IProfileController, IProfileService, IProfileRepository } from "../../../../src/features/v1/profile/types";
import { IUserRepository } from "../../../../src/features/v1/user/types";

// Helper imports
import { createMockPrisma, mk_prismaUserMethod, mk_prismaProfileMethod } from "../../../__mocks__/prisma.test-utils";
import { createProfileRepositoryMock } from "../../../__mocks__/profileRepository.test-utils";
import { createUserRepositoryMock } from "../../../__mocks__/userRepository.test-utils";
import { expressHelper } from "../../../__helper__/expressHelper";
import { jwtFakesHelper_fn } from "../../../__helper__/jwtFakesHelper";
import { createJwtServiceMock } from "../../../__mocks__/jwtService.mock";
import { getMockCalls, testHaveProperties } from "../../../__helper__/mockHelper";

const mockPrisma = createMockPrisma();
const mockPrismaUserTable = mk_prismaUserMethod(mockPrisma);
const mockPrismaProfileTable = mk_prismaProfileMethod(mockPrisma);

describe("ProfileController test suite", () => {
    let profileRepository: IProfileRepository = createProfileRepositoryMock(mockPrisma);
    let userRepository: IUserRepository = createUserRepositoryMock(mockPrisma);
    let profileService: IProfileService = new ProfileService({
        profileRepository: profileRepository,
        userRepository: userRepository,
    });
    let profileController: IProfileController = new ProfileController(profileService);
    let jwtService: IJwtService;
    let defaultUserInfo = {
        email: "dummyEmail",
        role: "GUEST",
        id: "dummyId",
    };

    beforeAll(() => {
        profileRepository = createProfileRepositoryMock(mockPrisma);
        userRepository = createUserRepositoryMock(mockPrisma);
        profileService = new ProfileService({ profileRepository: profileRepository, userRepository: userRepository });
        profileController = new ProfileController(profileService);
        jwtService = createJwtServiceMock();
    });

    describe("getProfile()", () => {
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        let jwtHelper: any;

        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, defaultUserInfo);
            express = expressHelper({
                authorizedUser: jwtHelper.getDefaultJwtData(),
            }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaProfileTable.findUniqueOrThrow.setCustomResolvedvalue({
                ...mockPrismaProfileTable.findUniqueOrThrow.getDefaultResolvedValue(),
                user_id: defaultUserInfo.id,
            });
            Object.keys(express.response).forEach((e) => {
                ((express.response as any)[e] as jest.Mock).mockClear();
            });

            (express.next as jest.Mock).mockClear();
        });
        afterEach(() => {
            mockPrismaProfileTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should reach ProfileRepository.findUniqueOrThrow call stack", async () => {
            await profileController.getProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaProfileTable.findUniqueOrThrow.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.findUniqueOrThrow.getCalls().where.user_id).toEqual(defaultUserInfo.id);
        });

        it("Should respond with valid Profile Data", async () => {
            await profileController.getProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            testHaveProperties(getMockCalls(express.response.send as jest.Mock), [
                "user_id",
                "user_name",
                "first_name",
                "last_name",
                "contact",
                "address",
                "membership_date",
                "status",
                "total_fines",
                "updated_at",
            ]);
        });

        it("Should propagate any error instance via express NextFunction", async ()=>{
            mockPrismaProfileTable.findUniqueOrThrow.setMockResolveError("Test");
            await profileController.getProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
          expect(express.next).toHaveBeenCalled();
      })
    });

    describe("updateUserProfile()", () => {
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        let jwtHelper: any;
        let updatedProfile = {
            user_name: "dummy_update_user_name",
            first_name: "dummy_update_first_name",
            last_name: "dummy_update_last_name",
            contact: "dummy_update_contact",
            address: "dummy_update_address",
        };

        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, defaultUserInfo);
            express = expressHelper({
                user_name: updatedProfile.user_name,
                first_name: updatedProfile.first_name,
                last_name: updatedProfile.last_name,
                contact: updatedProfile.contact,
                address: updatedProfile.address,
                authorizedUser: jwtHelper.getDefaultJwtData(),
            }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaProfileTable.upsert.setCustomResolvedvalue({
                ...mockPrismaProfileTable.findUniqueOrThrow.getDefaultResolvedValue(),
                user_id: defaultUserInfo.id,
                user_name: updatedProfile.user_name,
                first_name: updatedProfile.first_name,
                last_name: updatedProfile.last_name,
                contact: updatedProfile.contact,
                address: updatedProfile.address,
            });
            Object.keys(express.response).forEach((e) => {
                ((express.response as any)[e] as jest.Mock).mockClear();
            });
            (express.next as jest.Mock).mockClear();
        });

        afterEach(() => {
            mockPrismaProfileTable.upsert.executeClearMock();
        });

        it("Should reach ProfileRepository.upsert call stack", async () => {
            await profileController.updateUserProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaProfileTable.upsert.getMockfn()).toHaveBeenCalled();
            const mockCall = mockPrismaProfileTable.upsert.getCalls();
            expect(mockCall.update.user_name).toEqual(updatedProfile.user_name);
            expect(mockCall.update.first_name).toEqual(updatedProfile.first_name);
            expect(mockCall.update.last_name).toEqual(updatedProfile.last_name);
            expect(mockCall.update.contact).toEqual(updatedProfile.contact);
            expect(mockCall.update.address).toEqual(updatedProfile.address);
        });

        it("Should respond with valid Profile Data", async () => {
            await profileController.updateUserProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            testHaveProperties(getMockCalls(express.response.send as jest.Mock), [
                "user_id",
                "user_name",
                "first_name",
                "last_name",
                "contact",
                "address",
                "membership_date",
                "status",
                "total_fines",
                "updated_at",
            ]);
        });

        it("Should propagate any error instance via express NextFunction", async ()=>{
            mockPrismaProfileTable.findUniqueOrThrow.setMockResolveError("Test");
            await profileController.getProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
          expect(express.next).toHaveBeenCalled();
      })
    });

    describe("LibrarianUpdateProfile()", () => {
        let express: {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        };
        let jwtHelper: any;
        let adminUpdate = {
            total_fines: new Prisma.Decimal(10),
            status: "ACTIVE",
            email: "dummy_emails",
        };
        beforeAll(() => {
            jwtHelper = jwtFakesHelper_fn(jwtService, defaultUserInfo);
            express = expressHelper({
                total_fines: adminUpdate.total_fines,
                status: adminUpdate.status,
                email: adminUpdate.email,
                authorizedUser: jwtHelper.getDefaultJwtData(),
            }).declareAllExpressPartials();
        });

        beforeEach(() => {
            mockPrismaProfileTable.upsert.setCustomResolvedvalue({
                ...mockPrismaProfileTable.upsert.getDefaultResolvedValue(),
                user_id: defaultUserInfo.id,
                total_fines: adminUpdate.total_fines,
                status: adminUpdate.status as any,
            });
            mockPrismaUserTable.findUniqueOrThrow.setCustomResolvedvalue({
                ...mockPrismaUserTable.findUniqueOrThrow.getDefaultResolvedValue(),
                user_id: adminUpdate.email,
            });

            Object.keys(express.response).forEach((e) => {
                ((express.response as any)[e] as jest.Mock).mockClear();
            });

            (express.next as jest.Mock).mockClear();
        });
        afterEach(() => {
            mockPrismaProfileTable.upsert.executeClearMock();
            mockPrismaUserTable.findUniqueOrThrow.executeClearMock();
        });

        it("Should reach ProfileRepository.updsert call stack", async () => {
            await profileController.librarianUpdateUserProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            expect(mockPrismaProfileTable.upsert.getMockfn()).toHaveBeenCalled();
            expect(mockPrismaProfileTable.upsert.getCalls().where.user_id).toEqual(adminUpdate.email);
            expect(mockPrismaProfileTable.upsert.getCalls().update.total_fines).toEqual(adminUpdate.total_fines);
            expect(mockPrismaProfileTable.upsert.getCalls().update.status).toEqual(adminUpdate.status);
        });

        it("Should respond with valid Profile Data", async () => {
            await profileController.updateUserProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
            testHaveProperties(getMockCalls(express.response.send as jest.Mock), ["status", "total_fines"]);
        });

        it("Should propagate any error instance via express NextFunction", async ()=>{
            mockPrismaProfileTable.findUniqueOrThrow.setMockResolveError("Test");
            await profileController.getProfile(
                express.request as Request,
                express.response as Response,
                express.next as NextFunction,
            );
          expect(express.next).toHaveBeenCalled();
      })
    });
});
