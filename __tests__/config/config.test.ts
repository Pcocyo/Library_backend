import Env from "../../src/config/config";

describe("Env Test", () => {
    afterAll(() => {
        (Env as any).instance = null;
    });

    it("should return Port", () => {
        expect(Env.getPORT()).not.toBeNull();
    });
});
