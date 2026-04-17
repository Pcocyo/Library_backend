import { IBcryptService } from "../../src/core/security/interfaces";
import BcryptService from "../../src/core/security/bcrypt.service";
import { jest } from "@jest/globals";
export const bcryptServiceMock_hashFnReturnValue = "hashPassword"

export function createBcryptServiceMock(): IBcryptService {
    let bcryptService = new BcryptService({
        JWT_SECRET: "test-jwt-secret",
        BCRYPT_SALT: 1,
    });
    jest.spyOn(bcryptService,"hashPassword").mockResolvedValue(bcryptServiceMock_hashFnReturnValue);
    jest.spyOn(bcryptService,"comparePassword");
    return bcryptService;
}

export function createBcryptServiceFakes():IBcryptService{
   let bcryptService = new BcryptService({
        JWT_SECRET: "test-jwt-secret",
        BCRYPT_SALT: 1,
   })

   return bcryptService;
}
