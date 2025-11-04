import { Server } from "../../src/Server/Server.ts";
import { jest } from "@jest/globals";
import request from "supertest";
import { App } from "supertest/types";
import bcrypt from "bcrypt";
import User, { UserRole } from "../../src/Controller/User/User.ts";
import Env from "../../src/Config/config.ts";

describe("Create, Delete, Read Test Suite (Unit Test)", () => {
    let dummyId: string = "dummyId";
    let dummyEmail: string = "dummyEmail";
    let dummyPassword: string = "dummyPassword";
    let dummyRole: UserRole = UserRole.GUEST;
    let dummyCreated_at: Date = new Date();
    let serverInstance: Server;
    let serverApp: App;
    let spy;
    const payload = {
        email:"example@example.com",
        password:"TestPassword123@"
    }

    beforeAll(() => {
        serverInstance = Server.getInstance();
        serverApp = (serverInstance as any).app;
    });

    beforeEach(() => {
        spy = jest.spyOn(User, "createNewUser")
        spy.mockResolvedValue(
            User.tests__createTestUser(
                dummyId,
                dummyEmail,
                dummyPassword,
                dummyRole,
                dummyCreated_at,
        ))
    });

    afterEach(()=>{
        spy.mockRestore();
    })

    it("Respond with jwtToken",async ()=>{
        const response = await request(serverApp).post("/user/create").send(payload);
        expect(response.body).toHaveProperty("token");
        expect(response.body.token).not.toBeNull();
        console.log(Env.getValidateToken(response.body.token));
    })

    it("Call User.createNewUser with crypted password",async ()=>{
        const response = await request(serverApp).post("/user/create").send(payload)
        const passwordCall = spy.mock.calls[0][0].password;
        expect(await bcrypt.compare(payload.password,passwordCall)).toBeTruthy();
    })
});
