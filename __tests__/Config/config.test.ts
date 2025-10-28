import Env from "../../src/Config/config";

import User from "../../src/Controller/User/User";
import { UserRole } from "../../src/Controller/User/User";

import type { UserJwtPayloadInterface } from "../../src/Config/config.interface";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

describe("Env Test", () => {

    afterAll(() => {
        (Env as any).instance = null;
    });

    it("should return Port", () => {
        expect(Env.getPORT()).not.toBeNull();
    });

    it("should return db url", () => {
        let field = ["host", "port", "user", "password", "name"];
        field.forEach((key) =>
            expect(Env.getDB_URL()[key]).not.toBeNull(),
        );
    });

    //jwttoken not yet configured
    it("should return jwttoken", () => {
        expect(Env.getJWTOKEN()).not.toBeNull();
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
        const jwtToken: string = Env.getGenerateJwtToken(dummyUser);
        const decode = jwt.verify(
            jwtToken,
            Env.getJWTOKEN(),
        ) as UserJwtPayloadInterface;
        expect(jwtToken).not.toBe(null);
        expect(decode.userEmail).toBe(dummyEmail);
        expect(decode.userRole).toBe(dummyRole);
    });

    it("should validate jwt correctly", () => {
        const dummyEmail = "dummyEmai";
        const dummyRole = UserRole.GUEST;
        const dummyUserSign: UserJwtPayloadInterface = {
            userEmail: dummyEmail,
            userRole: dummyRole,
        };
        const jwtToken: string = jwt.sign(dummyUserSign, Env.getJWTOKEN());
        const jwtDecode = Env.getValidateToken(jwtToken);
        expect(jwtDecode.userEmail).toBe(dummyEmail);
        expect(jwtDecode.userRole).toBe(dummyRole);
    });

    // Bcrypt test
    
    it("Should generate Bcrypt string correctly",async ()=>{
        const dummyPassword = "dummyPassword";
        const bcryprStr = await Env.getGenerateBcrypt(dummyPassword);
        expect(bcrypt.compare(dummyPassword,bcryprStr)).toBeTruthy();
    })

    it("Should generate Bcrypt string correctly",async ()=>{ 
        const dummyPassword = "dummyPassword";
        const bcryprStr = await bcrypt.hash(dummyPassword,10);
        expect(Env.getValidatePassword(dummyPassword,bcryprStr)).toBeTruthy();
    })
});
