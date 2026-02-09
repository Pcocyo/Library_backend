import { JwtPayload } from "jsonwebtoken";

export interface UserPayload {
    email: string;
    role: string;
    id: string;
}

export interface AccessTokenPayload extends JwtPayload {
    email: string;
    role: string;
    id: string;
}

export interface IJwtService {
    generateJwtToken(UserPayload: UserPayload): string;
    validateJwtToken(JwtToken: string): AccessTokenPayload;
}
