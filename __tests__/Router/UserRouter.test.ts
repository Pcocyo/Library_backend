import { Server } from "../../src/Server/Server.ts";
import request from "supertest";
import { App } from "supertest/types";
import bcrypt from "bcrypt";
import { jest } from "@jest/globals";
import User, { UserRole } from "../../src/Controller/User/User.ts";
import { UserJwtPayloadInterface } from "../../src/Config/config.interface.ts";
import Env from "../../src/Config/config.ts";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import jwt from "jsonwebtoken";

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
    dummyUserInstance.setEmail = jest.fn() as any;
    dummyUserInstance.setPassword = jest.fn() as any;
    dummyUserInstance.setRole = jest.fn() as any;
    let getUserByEmailMock: any;

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
    });

    afterEach(() => {
        getUserByEmailMock.mockRestore();
    });

    it("put /user/update should return a valid jwt token on valid payload", async () => {
        const payload = {
            requestToken: dummyToken,
            updateData: {
                email: "example@gmail.com",
                password: "TestPassword123@",
                role: UserRole.GUEST,
            },
        };
        try {
            const response = await request(serverApp)
                .put("/user/update")
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
        } catch (error) {
            console.log(error);
        }
    });
   it("put /user/update should return an error on invalid user email", async()=>{
         const payload = {
            requestToken: dummyToken,
            updateData: {
               email:"invalidEmail",
               password: "TestPassword123@",
               role: UserRole.GUEST,
            }
         }
         const response = await request(serverApp).put("/user/update").send(payload);
         expect(response.body).not.toHaveProperty("token");
         expect(response.body.token).toBeUndefined();
         expect(response.body).toHaveProperty("error");
         expect(response.body.error).not.toBeNull();
   })

   it("put /user/update should return an error on invalid user password",async ()=>{
      const payload = {
            requestToken: dummyToken,
            updateData: {
               email:"example@gmail.com",
               password: "invalidPassword",
               role: UserRole.GUEST,
            }
      }
      const response = await request(serverApp).put("/user/update").send(payload);
      expect(response.body).not.toHaveProperty("token");
      expect(response.body.token).toBeUndefined();
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).not.toBeNull();
   })
    
   it("put /user/update should return an error on invalid user role",async ()=>{
      const payload = {
            requestToken: dummyToken,
            updateData: {
               email:"example@gmail.com",
               password: "TestPassword123@",
               role: "invalidRole",
            }
      }
      const response = await request(serverApp).put("/user/update").send(payload);
      expect(response.body).not.toHaveProperty("token");
      expect(response.body.token).toBeUndefined();
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).not.toBeNull();
   })
});

describe("Create, Delete, Read Test Suite (Unit Test)", () => {
    let dummyId: string = "dummyId";
    let dummyEmail: string = "dummyEmail@example.com";
    let dummyPassword: string = "dummyPassword123@";
    let dummyRole: UserRole = UserRole.GUEST;
    let dummyCreated_at: Date = new Date();
    let serverInstance: Server;
    let serverApp: App;
    let createNewUserSpy: any;
    let getUserSpy: any;
    let deleteUserSpy: any;

    const payload = {
        email: dummyEmail,
        password: dummyPassword,
    };

    const invalidEmailPayload = {
        email: "invalidEmail",
        password: "ValidPassword@",
    };

    const invalidPasswordPayload = {
        email: "example@example.com",
        password: "invalidpassword",
    };

    const invalidTokenPayload = {
        email: dummyEmail,
        password: dummyPassword,
        requestToken: "invalidToken",
    };

    const nullTokenPayload = {
        email: dummyEmail,
        password: dummyPassword,
    };

    let tokenPayload: any;
    let dummyUser: User;

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
        tokenPayload = {
            email: dummyEmail,
            password: dummyPassword,
            requestToken: Env.getGenerateJwtToken(dummyUser),
        };

        serverInstance = Server.getInstance();
        serverApp = (serverInstance as any).app;
    });

    beforeEach(async () => {
        jest.resetModules();
        jest.isolateModules(() => {
            createNewUserSpy = jest.spyOn(User, "createNewUser");
            getUserSpy = jest.spyOn(User, "getUserByEmail");
            deleteUserSpy = jest.spyOn(User, "deleteUser");
            createNewUserSpy.mockResolvedValue(dummyUser);
            getUserSpy.mockResolvedValue(dummyUser);
            deleteUserSpy.mockResolvedValue(dummyUser);
        });
    });

    afterEach(() => {
        createNewUserSpy.mockRestore();
        getUserSpy.mockRestore();
        deleteUserSpy.mockRestore();
    });

    // create user logic
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

    it("post /user/create route Call User.createNewUser with crypted password", async () => {
        const response = await request(serverApp)
            .post("/user/create")
            .send(payload);
        const passwordCall = createNewUserSpy.mock.calls[0][0].password;
        expect(
            await bcrypt.compare(payload.password, passwordCall),
        ).toBeTruthy();
    });

    it("post /user/create route Respond with error if user enter an invalid email", async () => {
        const response = await request(serverApp)
            .post("/user/create")
            .send(invalidEmailPayload);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    it("post /user/create route Respond with error if user enter an invalid password", async () => {
        const response = await request(serverApp)
            .post("/user/create")
            .send(invalidPasswordPayload);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    // get User by email logic
    it("get /user/getUser respond with valid jwtToken", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .send(tokenPayload);
        expect(response.body).toHaveProperty("token");
        let responsedToken: UserJwtPayloadInterface = decodeToken(
            response.body.token,
        );
        expect(responsedToken).toHaveProperty("userId");
        expect(responsedToken).toHaveProperty("userEmail");
        expect(responsedToken).toHaveProperty("userRole");
    });

    it("get /user/getUser respond with error when have been called with invalid jwtToken", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .send(invalidTokenPayload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body).toHaveProperty("error");
    });

    it("get /user/getUser return with error when have been called with invalid email", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .send(invalidEmailPayload);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    it("get /user/getUser return with error when have been called with null request token", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .send(nullTokenPayload);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    // login logic
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

    it("get /user/login response with error when user enter invalid email payload", async () => {
        const response = await request(serverApp)
            .post("/user/login")
            .send(invalidEmailPayload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    it("get /user/login response with error when user enter invalid password payload", async () => {
        const response = await request(serverApp)
            .post("/user/login")
            .send(invalidPasswordPayload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    //delete user logic
    it("delete /user/delete response with success when user enter a valid token", async () => {
        const response = await request(serverApp)
            .delete("/user/delete")
            .send(tokenPayload);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).not.toBeNull();
    });

    it("delete /user/delete response with success when user enter a valid token", async () => {
        const response = await request(serverApp)
            .delete("/user/delete")
            .send(invalidTokenPayload);
        expect(response.body).not.toHaveProperty("message");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });
});
