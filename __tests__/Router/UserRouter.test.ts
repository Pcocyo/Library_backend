import { Server } from "../../src/Server/Server.ts";
import request from "supertest";
import { App } from "supertest/types";
import bcrypt from "bcrypt";
import { jest } from "@jest/globals";
import User, { UserRole } from "../../src/Controller/User/User.ts";
import { UserJwtPayloadInterface } from "../../src/Config/config.interface.ts";
import Profile from "../../src/Controller/Profile/Profile.ts";
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
            updateData: {
                email: "example@gmail.com",
                password: "TestPassword123@",
                role: UserRole.GUEST,
            },
        };
    });

    afterEach(() => {
        getUserByEmailMock.mockRestore();
    });

    it("put /user/update should return an error when requested without any token authorization on request header", async () => {
        const response = await request(serverApp)
            .put("/user/update")
            .send(payload);
        expect(response.body).toHaveProperty("error");
        expect(response.status).toBe(400);
    });
    it("put /user/update should call User.setPassword() with bcrypt payload when password included", async () => {
        const response = await request(serverApp)
            .put("/user/update")
            .set("Authorization", dummyToken)
            .send(payload);
        const setPasswordCalls = setPasswordMock.mock.calls[0][0];
        expect(setPasswordCalls).not.toBe(payload.updateData.password);
        expect(await Env.getValidatePassword(payload.updateData.password,setPasswordCalls as string)).toBeTruthy();
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
    it("put /user/update should return an error on invalid user email", async () => {
        payload.updateData.email = "invalidEmail";
        const response = await request(serverApp)
            .put("/user/update")
            .set("Authorization", dummyToken)
            .send(payload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body.token).toBeUndefined();
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    it("put /user/update should return an error on invalid user password", async () => {
        payload.updateData.password = "invalidpassword";
        const response = await request(serverApp)
            .put("/user/update")
            .set("Authorization", dummyToken)
            .send(payload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body.token).toBeUndefined();
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

    it("put /user/update should return an error on invalid user role", async () => {
        payload.updateData.role = "invalidRole";
        const response = await request(serverApp)
            .put("/user/update")
            .set("Authorization", dummyToken)
            .send(payload);
        expect(response.body).not.toHaveProperty("token");
        expect(response.body.token).toBeUndefined();
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
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

    const getUserPayload = {
        email: dummyEmail,
    };

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
            createNewUserSpy.mockResolvedValue(dummyUser);
            getUserSpy.mockResolvedValue(dummyUser);
            deleteUserSpy.mockResolvedValue(dummyUser);
            createProfileSpy.mockResolvedValue(null);
        });
    });

    afterEach(() => {
        createNewUserSpy.mockRestore();
        getUserSpy.mockRestore();
        deleteUserSpy.mockRestore();
        createProfileSpy.mockRestore();
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

    it("get /user/getUser respond with error when request was unauthorized with jwtToken", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .send(getUserPayload);
        expect(response.body).toHaveProperty("error");
        expect(response.status).toBe(400);
    });

    it("get /user/getUser return with error when have been called with invalid email", async () => {
        const response = await request(serverApp)
            .get("/user/getUser")
            .set("Authorization", dummyToken)
            .send(invalidEmailPayload.email);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
    });

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

    it("delete /user/delete response with error when user did not have authorization access", async () => {
        const response = await request(serverApp).delete("/user/delete");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).not.toBeNull();
        expect(response.status).toBe(400);
    });

    it("delete /user/delete response with success when user input correct data", async () => {
        const response = await request(serverApp)
            .delete("/user/delete")
            .set("Authorization", dummyToken);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).not.toBeNull();
        expect(response.status).toBe(200);
    });
});
