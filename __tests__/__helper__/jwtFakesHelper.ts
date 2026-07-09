import { AccessTokenPayload } from "../../src/core/security/interfaces";
import { IJwtService } from "../../src/core/security/interfaces";

export function jwtFakesHelper_fn(jwtService: IJwtService, jwtData: { email: string; role: string; id: string }) {
    let defaultJwtData: AccessTokenPayload = jwtData;
    return {
        getJwtPayload: () => jwtService.generateJwtToken(defaultJwtData),
        getDefaultJwtData: (): AccessTokenPayload => defaultJwtData,
    };
}
