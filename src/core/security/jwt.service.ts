import jwt from "jsonwebtoken";
import { IJwtService, UserPayload,AccessTokenPayload } from "./interfaces";
import { ISecurityConfig } from "../../config/config.interface";

export default class JwtService implements IJwtService {
    private readonly SecurityConfig: ISecurityConfig;

    public constructor(SecurityConfig: ISecurityConfig) {
        this.SecurityConfig = SecurityConfig;
    }

    public generateJwtToken(UserPayload: UserPayload): string {
        const token = jwt.sign(
            {
                email: UserPayload.email,
                role: UserPayload.role,
                id: UserPayload.id,
            },
            this.SecurityConfig.JWT_SECRET,
            { expiresIn: "1h" },
        );
        return token;
    }

    public validateJwtToken(JwtToken: string): AccessTokenPayload {
        const payload: AccessTokenPayload = jwt.verify(
            JwtToken,
            this.SecurityConfig.JWT_SECRET,
        ) as AccessTokenPayload;
        return payload;
    }
}
