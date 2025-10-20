import { DevApp } from "../../../dist/Server/App/DevApp";
import request from 'supertest';

describe("DevApp class test", () => {
    let instance: DevApp;
    beforeEach(() => {
        instance = DevApp.getInstance();
    })
    afterAll(() => {
        (DevApp as any).instance = null;
    })

    it("should have one instance", () => {
        let instance2: DevApp = DevApp.getInstance();
        expect(instance).toBe(instance2);
    })

    it("should return express application", () => {
        let returnValue = instance.getApp();
        expect(returnValue).toHaveProperty("use");
        expect(returnValue).toHaveProperty("listen");
        expect(typeof returnValue.use).toBe("function");
        expect(typeof returnValue.listen).toBe("function");
    })

    it("should use cors middleware", async () => {
        let app = instance.getApp();
        app.get("/test", (req, res) => {
            res.json({ message: "Ok" });
        })
        const response = await request(app).get("/test");
        expect(response.header["access-control-allow-origin"]).toBe("*");
    })

    it("should use helmet middleware", async () => {
        let app = instance.getApp();
        app.get("/test", (req, res) => {
            res.json({ message: "Ok" })
        })

        const response = await request(app).get("/test");
        expect(response.header["Content-Security-Policy"]).not.toBeNull();
        expect(response.header["Cross-Origin-Opener-Policy"]).not.toBeNull();
        expect(response.header["Cross-Origin-Resource-Policy"]).not.toBeNull();
        expect(response.header["Origin-Agent-Cluster"]).not.toBeNull();
        expect(response.header["Referrer-Policy"]).not.toBeNull();
        expect(response.header["Strict-Transport-Security"]).not.toBeNull();
        expect(response.header["X-Content-Type-Options"]).not.toBeNull();
        expect(response.header["X-DNS-Prefetch-Control"]).not.toBeNull();
        expect(response.header["X-Frame-Options"]).not.toBeNull();
        expect(response.header["X-Permitted-Cross-Domain-Policies"]).not.toBeNull();
        expect(response.header["X-Powered-By"]).not.toBeNull();
        expect(response.header["X-XSS-Protection"]).not.toBeNull();
    })

    it("should use express json", async () => {
        const app = instance.getApp();
        app.get("/test", (req, res) => {
            res.json({ message: "Ok" })
        })
        const response = await request(app).get("/test");
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
    })

    it("should able to respond", async () => {
        const app = instance.getApp();
        app.post("/test", (req, res) => {
            res.json({ message: "Ok" })
        })
        const response = await request(app).get("/test");
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Ok");
    })
})
