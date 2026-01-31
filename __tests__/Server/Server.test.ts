import { Server } from "../../src/server/server.ts"

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
})
