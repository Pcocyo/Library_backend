import Env from "../../src/config/config";
import bcrypt from "bcrypt";

describe("Env Test", () => {
    afterAll(() => {
        (Env as any).instance = null;
    });

    it("should return Port", () => {
        expect(Env.getPORT()).not.toBeNull();
    });

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
