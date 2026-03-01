import { IJwtService } from "../../src/core/security/interfaces";
import JwtService from "../../src/core/security/jwt.service";

export function createJwtServiceMock(): IJwtService {
    let jwtService: JwtService = new JwtService({
        JWT_SECRET: "test-secrets",
        BCRYPT_SALT:1,
    });
    return jwtService;
}
