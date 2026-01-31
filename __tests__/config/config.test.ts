import Env from "../../src/config/config";
import { UserService } from "../../src/features/user";
import { UserRole } from "../../src/features/user/types/user-service.types";
import { UserJwtPayloadInterface } from "../../src/config/config.types";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

describe("Env Test", () => {
    afterAll(() => {
        (Env as any).instance = null;
    });

    it("should return Port", () => {
        expect(Env.getPORT()).not.toBeNull();
    });

   // it("should return db url", () => {
   //     let field = ["host", "port", "user", "password", "name"];
   //     field.forEach((key) => expect(Env.getDB_URL()[key]).not.toBeNull());
   // });

    //jwttoken not yet configured
    it("should return jwttoken", () => {
        expect(Env.getJWTOKEN()).not.toBeNull();
    });

    it("should generate jwt token when generateJwtToken() called", () => {
        const dummyId = "dummyId";
        const dummyEmail = "dummyEmail";
        const dummyPassword = "dummyPassword";
        const dummyRole = "GUEST";
        const dummyDate = new Date();
        const dummyUser: UserService = UserService.tests__createTestUser(
            dummyId,
            dummyEmail,
            dummyPassword,
            UserRole[dummyRole as keyof typeof UserRole],
            dummyDate,
        );
        const jwtToken: string = Env.getGenerateJwtToken(dummyUser);
        const decode = jwt.verify(
            jwtToken,
            Env.getJWTOKEN(),
        ) as UserJwtPayloadInterface;
        expect(jwtToken).not.toBe(null);
        expect(decode.userEmail).toBe(dummyEmail);
        expect(decode.userRole).toBe(dummyRole);
        expect(decode).toHaveProperty("userId");
        expect(decode.userId).not.toBeNull();
    });

    it("should validate jwt correctly", () => {
        const dummyEmail = "dummyEmai";
        const dummyRole = UserRole.GUEST;
        const dummyId = "dummyId";
        const dummyUserSign: UserJwtPayloadInterface = {
            userEmail: dummyEmail,
            userRole: dummyRole,
            userId: dummyId,
        };
        const jwtToken: string = jwt.sign(dummyUserSign, Env.getJWTOKEN());
        const jwtDecode = Env.getValidateToken(jwtToken);
        expect(jwtDecode.userEmail).toBe(dummyEmail);
        expect(jwtDecode.userRole).toBe(dummyRole);
        expect(jwtDecode).toHaveProperty("userId");
        expect(jwtDecode.userId).not.toBeNull();
    });

    // Bcrypt test

    it("Should generate Bcrypt string correctly", async () => {
        const dummyPassword = "dummyPassword";
        const bcryprStr = await Env.getGenerateBcrypt(dummyPassword);
        expect(bcrypt.compare(dummyPassword, bcryprStr)).toBeTruthy();
    });

    it("Should generate Bcrypt string correctly", async () => {
        const dummyPassword = "dummyPassword";
        const bcryprStr = await bcrypt.hash(dummyPassword, 10);
        expect(Env.getValidatePassword(dummyPassword, bcryprStr)).toBeTruthy();
    });
});
