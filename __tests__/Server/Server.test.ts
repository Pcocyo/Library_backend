import { Server } from "../../dist/Server/Server"
import request from 'supertest';
import { UserRouter } from "../../dist/Router/UserRouter"

describe("Server class test", () => {
    let instance: Server;
    let app: any;

    beforeAll(async () => {
        instance = Server.getInstance();
        app = (instance as any).app;
    })

    it("should have only one instance", () => {
        let instance2 = Server.getInstance();
        expect(instance).toBe(instance2);
    })

    it("should have /users routes", async () => {
        const response = await request(app).get('/user/');
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("userRouter");
    })

    it("define a userRouter class instance", () => {
        let userRouter = (instance as any).userRouter;
        expect(userRouter).toBeInstanceOf(UserRouter);
    })
})
