import { IBcryptService } from "../../src/core/security/interfaces";
import BcryptService from "../../src/core/security/bcrypt.service";
import { jest } from "@jest/globals";

export function createBcryptServiceMock(): IBcryptService {
    let bcryptService = new BcryptService({
        JWT_SECRET: "test-jwt-secret",
        BCRYPT_SALT: 1,
    });
    jest.spyOn(bcryptService,"hashPassword").mockResolvedValue("hashedPassword");
    jest.spyOn(bcryptService,"comparePassword").mockResolvedValue(true);
    return bcryptService;
}
