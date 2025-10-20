import Env from "../../dist/Config/config";

describe("Env Test", () => {
    let instance: Env;
    beforeEach(() => {
        instance = Env.getInstance();
    })
    afterAll(() => {
        (Env as any).instance = null;
    })
    it("should have only one instance", () => {
        const instance2: Env = Env.getInstance();
        expect(instance).toBe(instance2);
    })

    it("should return Port", () => {
        expect(instance.getPORT()).not.toBeNull()
    })

    it("should return db url", () => {
        let field = ["host", "port", "user", "password", "name"];
        field.forEach(key => expect(instance.getDB_URL()[key]).not.toBeNull());
    })

    it("should return jwttoken", () => {
        expect(instance.getJWTOKEN()).not.toBeNull();
    })

    it("should generate jwt token when generateJwtToken() called", () => {
        const user = {
            email: "dummyUser@gmail.com",
            role: "GUEST"
        }
        const jwtToken: String = instance.generateJwtToken(user);
        expect(jwtToken).not.toBe(null);
    })
})
