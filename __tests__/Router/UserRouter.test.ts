import { Server } from "../../src/Server/Server.ts";
import request from "supertest";
import { App } from "supertest/types";
import bcrypt from "bcrypt";
import { jest } from "@jest/globals";
import User, { UserRole } from "../../src/Controller/User/User.ts";
import { UserJwtPayloadInterface } from "../../src/Config/config.interface.ts";
import Profile from "../../src/Controller/Profile/Profile.ts";
import { ProfileStatus } from "../../src/Controller/Profile/Profile.interface.ts";
import Env from "../../src/Config/config.ts";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import jwt from "jsonwebtoken";
import { ClientErrorCode } from "../../src/Errors/ClientError.ts";
import { ValidationErrorCode } from "../../src/Errors/ValidationError.ts";

describe("Update user test suite", () => {
   let dummyUserId = "dummyUseeId";
   let dummyUserEmail = "dummyUserEmail";
   let dummyUserPassword = "dummyUserPassword";
   let dummyUserRole = UserRole.GUEST;
   let dummyUserDate = new Date();
   let serverInstance: Server;
   let serverApp: App;
   let dummyUserInstance = User.tests__createTestUser(
      dummyUserId,
      dummyUserEmail,
      dummyUserPassword,
      dummyUserRole,
      dummyUserDate,
   );
   let dummyToken = Env.getGenerateJwtToken(dummyUserInstance);
   let setEmailMock = jest.fn();
   let setPasswordMock = jest.fn();
   let setRoleMock = jest.fn();
   dummyUserInstance.setEmail = setEmailMock as any;
   dummyUserInstance.setPassword = setPasswordMock as any;
   dummyUserInstance.setRole = setRoleMock as any;
   let getUserByEmailMock: any;
   let payload: any;

   let decodeToken = (tokenString: string): UserJwtPayloadInterface => {
      return Env.getValidateToken(tokenString);
   };

   beforeAll(() => {
      serverInstance = Server.getInstance();
      serverApp = (serverInstance as any).app;
   });

   beforeEach(() => {
      getUserByEmailMock = jest.spyOn(User, "getUserByEmail");
      getUserByEmailMock.mockResolvedValue(dummyUserInstance);
      payload = {
            email: "example@gmail.com",
            password: "TestPassword123@",
            userRole: UserRole.GUEST,
      };
   });

   afterEach(() => {
      getUserByEmailMock.mockRestore();
   });

   // /user/update error logic
   
   it("put /user/update should return an error when requested without any token authorization on request header", async () => {
      const response = await request(serverApp)
         .put("/user/update")
         .send(payload);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   });

   it("put /user/update Respond with Error code VALIDATION_ERROR_001 if email parameter is invalid format", async () => {
      payload.email = "invalidEmail";
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(payload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Email_Input);
      expect(response.status).toBe(400);
   });

   it("put /user/update should Respond with Error code CLIENT_ERROR_001 if email parameter is missing", async () => {
      const missingEmailPayload = {
            password: "TestPassword123@",
            role: UserRole.GUEST,
      }
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(missingEmailPayload);
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
   });

   it("put /user/update Respond with Error code VALIDATION_ERROR_002 if password parameter is invalid format", async () => {
      payload.password = "invalidpassword";
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(payload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Password_Input);
      expect(response.status).toBe(400);
   });

   it("put /user/update should Respond with Error code CLIENT_ERROR_001 if password parameter is missing", async () => {
      const missingEmailPayload = {
            email: "example@gmail.com",
            role: UserRole.GUEST,
      }
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(missingEmailPayload);
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
   });

   it("put /user/update Respond with Error code VALIDATION_ERROR_003 if userRole parameter is invalid format", async () => {
      payload.userRole = "invalidRole";
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(payload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_UserRole_Input);
      expect(response.status).toBe(400);
   });

   it("put /user/update should Respond with Error code CLIENT_ERROR_001 if userRole parameter is missing", async () => {
      const missingEmailPayload = {
            email: "example@gmail.com",
            password: "TestPassword123@"
      }
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(missingEmailPayload);
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
   });

   // /user/update success logic
   
   it("put /user/update should call User.setPassword() with bcrypt payload when password included", async () => {
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(payload);
      const setPasswordCalls = setPasswordMock.mock.calls[0][0];
      expect(setPasswordCalls).not.toBe(payload.password);
      expect(await Env.getValidatePassword(payload.password,setPasswordCalls as string)).toBeTruthy();
   });

   it("put /user/update should return a valid jwt token on valid payload", async () => {
      const response = await request(serverApp)
         .put("/user/update")
         .set("Authorization", dummyToken)
         .send(payload);
      expect(response.body).toHaveProperty("token");
      expect(response.body.token).not.toBeNull();
      const respondedToken = decodeToken(response.body.token);

      expect(respondedToken).toHaveProperty("userEmail");
      expect(respondedToken.userEmail).not.toBeNull();

      expect(respondedToken).toHaveProperty("userId");
      expect(respondedToken.userId).not.toBeNull();

      expect(respondedToken).toHaveProperty("userRole");
      expect(respondedToken.userRole).not.toBeNull();
   });

});

describe("Create, Delete, Read Test Suite (Unit Test)", () => {
   let dummyId: string = "dummyId";
   let dummyEmail: string = "dummyEmail@example.com";
   let dummyPassword: string = "dummyPassword123@";
   let dummyRole: UserRole = UserRole.GUEST;
   let dummyCreated_at: Date = new Date();
   let dummyToken: string;
   let serverInstance: Server;
   let serverApp: App;
   let createNewUserSpy: any;
   let getUserSpy: any;
   let deleteUserSpy: any;
   let createProfileSpy:any;
   let getProfileSpy:any;
   let deleteProfileSpy:any;


   const payload = {
      email: dummyEmail,
      password: dummyPassword,
   };

   const invalidEmailPayload = {
      email: "invalidEmail",
      password: "ValidPassword@",
   };

   const invalidPasswordPayload = {
      email: "example12@example.com",
      password: "invalidpassword",
   };

   const getUserPayload = {
      email: dummyEmail,
   };

   let initializeDummyProfile = ()=>{
      let dummyId = "dummyId";
      let dummyUserName = "dummyUserName";
      let dummyFirstName = "dummyFirstName";
      let dummyLastName = "dummyLastName";
      let dummyContact = "dummyContact";
      let dummyAddress = "dummyAddress";
      let dummyMembershipDate = new Date;
      let dummyStatus = ProfileStatus.ACTIVE;
      let dummyTotalFines = 0.0;
      let dummyUpdatedAt = new Date;

      return Profile.Tests__CreateProfile__(
         {
            user_id : dummyId,
            user_name: dummyUserName,
            first_name:dummyFirstName,
            last_name: dummyLastName,
            contact: dummyContact,
            address: dummyAddress,
            membership_date: dummyMembershipDate,
            status: dummyStatus,
            total_fines: dummyTotalFines,
            updated_at: dummyUpdatedAt,
         }
      )
   }
   let dummyUser: User;
   let dummyProfile:Profile = initializeDummyProfile();

   let decodeToken = (jwtToken: string): UserJwtPayloadInterface => {
      return jwt.verify(
         jwtToken,
         process.env.JWT_SECRET as string,
      ) as UserJwtPayloadInterface;
   };


   beforeAll(async () => {
      dummyUser = User.tests__createTestUser(
         dummyId,
         dummyEmail,
         await Env.getGenerateBcrypt(dummyPassword),
         dummyRole,
         dummyCreated_at,
      );
      dummyToken = Env.getGenerateJwtToken(dummyUser);
      serverInstance = Server.getInstance();
      serverApp = (serverInstance as any).app;
   });

   beforeEach(async () => {
      jest.resetModules();
      jest.isolateModules(() => {
         createNewUserSpy = jest.spyOn(User, "createNewUser");
         getUserSpy = jest.spyOn(User, "getUserByEmail");
         deleteUserSpy = jest.spyOn(User, "deleteUser");
         createProfileSpy = jest.spyOn(Profile,"CreateProfile");
         getProfileSpy = jest.spyOn(Profile,"GetByUserId");
         deleteProfileSpy = jest.spyOn(Profile,"DeleteProfile");
         createNewUserSpy.mockResolvedValue(dummyUser);
         getUserSpy.mockResolvedValue(dummyUser);
         deleteUserSpy.mockResolvedValue(dummyUser);
         createProfileSpy.mockResolvedValue(null);
         getProfileSpy.mockResolvedValue(dummyProfile);
         deleteProfileSpy.mockResolvedValue(null);
      });
   });

   afterEach(() => {
      createNewUserSpy.mockRestore();
      getUserSpy.mockRestore();
      deleteUserSpy.mockRestore();
      createProfileSpy.mockRestore();
      deleteProfileSpy.mockRestore();
      getProfileSpy.mockRestore();
   });

   // create user failed test

   it("post /user/create route Respond with Error code CLIENT_ERROR_001 if email parameter is missing", async() => {
      let missingEmailPayload = {
         password: "ValidPassword@",
      }
      const response = await request(serverApp)
         .post("/user/create")
         .send(missingEmailPayload);
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
   })

   it("post /user/create route Respond with Error code VALIDATION_ERROR_001 if user enter an invalid email", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(invalidEmailPayload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Email_Input);
      expect(response.status).toBe(400);
   });

   it("post /user/create route Respond with Error code CLIENT_ERROR_001 if password parameter is missing", async() => {
      let missingPasswordPayload = {
         email:"example12@example.com",
      }
      const response = await request(serverApp)
         .post("/user/create")
         .send(missingPasswordPayload);
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
   })

   it("post /user/create route Respond with Error code VALIDATION_ERROR_002 if user enter an invalid password format", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(invalidPasswordPayload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Password_Input);
      expect(response.status).toBe(400);
   });

   // create user success logic
   
   it("post /user/create route Respond with a valid jwtToken", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(payload);

      expect(response.body).toHaveProperty("token");
      expect(response.body.token).not.toBeNull();
      let responsedToken = decodeToken(response.body.token);

      expect(responsedToken).toHaveProperty("userId");
      expect(responsedToken.userId).not.toBeNull();
      expect(responsedToken).toHaveProperty("userEmail");
      expect(responsedToken.userEmail).not.toBeNull();
      expect(responsedToken).toHaveProperty("userRole");
      expect(responsedToken.userRole).not.toBeNull();
   });

   it("post /user/create route Call Profile.createProfile with correct parameter", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(payload);
      const createProfileCall = createProfileSpy.mock.calls[0][0];
      expect(createProfileCall).toHaveProperty("user_id");
      expect(createProfileCall.user_id).toBe(dummyUser.getId());
   });

   it("post /user/create route Call User.createNewUser with crypted password", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(payload);
      const passwordCall = createNewUserSpy.mock.calls[0][0].password;
      expect(
         await bcrypt.compare(payload.password, passwordCall),
      ).toBeTruthy();
   });

   it("post /user/create route respond with success and jwtToken", async () => {
      const response = await request(serverApp)
         .post("/user/create")
         .send(payload);
      const passwordCall = createNewUserSpy.mock.calls[0][0].password;
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token")
   });

   // get /user/getUser error logic

   it("get /user/getUser respond with error when request was unauthorized with jwtToken", async () => {
      const response = await request(serverApp)
         .get("/user/getUser")
         .send(getUserPayload);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   });

   it("get /user/getUser return with error when requested without email parameter", async () => {
      const response = await request(serverApp)
         .get("/user/getUser")
         .set("Authorization", dummyToken)
         .send();
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
      expect(response.status).toBe(400);
   });

   it("get /user/getUser return with error when have been called with invalid email", async () => {
      const response = await request(serverApp)
         .get("/user/getUser")
         .set("Authorization", dummyToken)
         .send({email:invalidEmailPayload.email});
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Email_Input);
      expect(response.status).toBe(400);
   });


   // get /user/getUser success logic
   
   it("get /user/getUser respond with valid user", async () => {
      const response = await request(serverApp)
         .get("/user/getUser")
         .set("Authorization", dummyToken)
         .send(getUserPayload);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("role");
   });


   // /user/login error logic
   
   it("get /user/login response with error when user enter wrong password", async () => {
      const wrongPasswordPayload = {
         email: payload.email,
         password: "WrongPassword@123",
      };
      const response = await request(serverApp)
         .post("/user/login")
         .send(wrongPasswordPayload);
      expect(response.body).not.toHaveProperty("token");
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).not.toBeNull();
   });

   it("get /user/login response with Error code CLIENT_ERROR_001 if email parameter is missing",async()=>{
      const missingEmailPayload = {
         password:payload.password,
      }
      const response = await request(serverApp)
         .post("/user/login")
         .send(missingEmailPayload)
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
      expect(response.status).toBe(400);
   })

   it("get /user/login Respond with Error code VALIDATION_ERROR_001 if user enter an invalid email", async () => {
      const response = await request(serverApp)
         .post("/user/login")
         .send(invalidEmailPayload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Email_Input);
      expect(response.status).toBe(400);
   });

   it("get /user/login response with Error code CLIENT_ERROR_001 if password parameter is missing",async()=>{
      const missingPasswordPayload = {
         email:payload.email
      };
      const response = await request(serverApp)
         .post("/user/login")
         .send(missingPasswordPayload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Missing_Parameter);
      expect(response.status).toBe(400);
   })

   it("get /user/login Respond with Error code VALIDATION_ERROR_001 if user enter an invalid password", async () => {
      const response = await request(serverApp)
         .post("/user/login")
         .send(invalidPasswordPayload);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("VALIDATION_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ValidationErrorCode.Invalid_Password_Input);
      expect(response.status).toBe(400);
   });

   // /user/login success logic
   
   it("get /user/login respond with valid jwt token", async () => {
      const response = await request(serverApp)
         .post("/user/login")
         .send(payload);
      expect(response.body).toHaveProperty("token");
      const responsedToken = decodeToken(response.body.token);
      expect(responsedToken).toHaveProperty("userId");
      expect(responsedToken).toHaveProperty("userEmail");
      expect(responsedToken).toHaveProperty("userRole");
   });

   // /user/delete error logic
   
   it("delete /user/delete response with error when user did not have authorization access", async () => {
      const response = await request(serverApp).delete("/user/delete");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("CLIENT_ERROR");
      expect(response.body).toHaveProperty("code");
      expect(response.body.code).toBe(ClientErrorCode.Unauthorized_Request);
   });

   // /user/delete success logic
   
   it("delete /user/delete route delete profile information before deleting user",async ()=>{
      const response = await request(serverApp).delete("/user/delete").set("Authorization",dummyToken);
      expect(deleteProfileSpy).toHaveBeenCalled();
   })

   it("delete /user/delete response with success when user input correct data", async () => {
      const response = await request(serverApp)
         .delete("/user/delete")
         .set("Authorization", dummyToken);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).not.toBeNull();
      expect(response.status).toBe(200);
   });
});
