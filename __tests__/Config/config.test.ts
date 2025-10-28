import Env from "../../src/Config/config";
import User from "../../src/Controller/User/User";
import { UserRole } from "../../src/Controller/User/User";
import type { UserJwtPayloadInterface } from "../../src/Config/config.interface";
import jwt from "jsonwebtoken";

describe("Env Test", () => {
    let instance: Env;
    beforeEach(() => {
        instance = Env.getInstance();
    });

    afterAll(() => {
        (Env as any).instance = null;
    });

    it("should have only one instance", () => {
        const instance2: Env = Env.getInstance();
        expect(instance).toBe(instance2);
    });

    it("should return Port", () => {
        expect(instance.getPORT()).not.toBeNull();
    });

    it("should return db url", () => {
        let field = ["host", "port", "user", "password", "name"];
        field.forEach((key) =>
            expect(instance.getDB_URL()[key]).not.toBeNull(),
        );
    });

    //jwttoken not yet configured
    it("should return jwttoken", () => {
        expect(instance.getJWTOKEN()).not.toBeNull();
    });

    it("should generate jwt token when generateJwtToken() called", () => {
        const dummyEmail = "dummyEmai";
        const dummyPassword = "dummyPassword";
        const dummyRole = UserRole.GUEST;
        const dummyDate = new Date();
        const dummyUser: User = new User(
            dummyEmail,
            dummyPassword,
            dummyRole,
            dummyDate,
        );
        const jwtToken: string = instance.getGenerateJwtToken(dummyUser);
        const decode = jwt.verify(
            jwtToken,
            instance.getJWTOKEN(),
        ) as UserJwtPayloadInterface;
        expect(jwtToken).not.toBe(null);
        expect(decode.userEmail).toBe(dummyEmail);
        expect(decode.userRole).toBe(dummyRole);
    });

    it("should validate", () => {
        const dummyEmail = "dummyEmai";
        const dummyRole = UserRole.GUEST;
        const dummyUserSign: UserJwtPayloadInterface = {
            userEmail: dummyEmail,
            userRole: dummyRole,
        };
        const jwtToken: string = jwt.sign(dummyUserSign, instance.getJWTOKEN());
        const jwtDecode = instance.getValidateToken(jwtToken);
        expect(jwtDecode.userEmail).toBe(dummyEmail);
        expect(jwtDecode.userRole).toBe(dummyRole);
    });
});
