import UserRouter from "../../src/Router/UserRouter.ts";
import { Server } from "../../src/Server/Server.ts";
import User, { UserRole } from "../../src/Controller/User/User.ts";
import {jest} from "@jest/globals"
import request from "supertest";
describe("Create, Delete, Read Test Suite (Unit Test)", () => {
    let dummyId: string = "dummyId";
    let dummyEmail: string = "dummyEmail";
    let password: string = "dummyPassword";
    let role: UserRole = UserRole.GUEST;
    let created_at: Date = new Date();
    let serverApp: Server;
    let mockCreateNewUser:jest.Mock<typeof User.createNewUser>;

    beforeAll(() => {
        serverApp = ((Server.getInstance()) as any).app
    });
    beforeEach(() => {
        jest.resetModules();
        jest.mock("../../src/Controller/User/User.ts");
        mockCreateNewUser = (User.createNewUser as jest.Mock<typeof User.createNewUser>);
    });

    it("create user when user enter a correct input", async() => {
         const response = await request(serverApp).get("/user/")
         console.log(response);
    });
});
