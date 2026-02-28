import jwt from "jsonwebtoken";
import { IJwtService, UserPayload,AccessTokenPayload } from "./interfaces";
import { ISecurityConfig } from "../../config/config.interface";
import { ErrorMapperGroup } from "../error/mappers";

export default class JwtService implements IJwtService {
    private readonly SecurityConfig: ISecurityConfig;

    public constructor(SecurityConfig: ISecurityConfig) {
        this.SecurityConfig = SecurityConfig;
    }

    public generateJwtToken(UserPayload: UserPayload): string {
      try {
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
      } catch (error) {
        throw ErrorMapperGroup.getInstance().mapError(error);
      }
    }

    public validateJwtToken(JwtToken: string): AccessTokenPayload{
      try {
         const payload: AccessTokenPayload = jwt.verify(
            JwtToken,
            this.SecurityConfig.JWT_SECRET,
         ) as AccessTokenPayload;
         return payload;
      } catch (error) {
         throw ErrorMapperGroup.getInstance().mapError(error);
      }
    }
}
