import { IBcryptService } from "./interfaces";
import { ISecurityConfig } from "../../config/config.interface";
import bcrypt from "bcrypt";

export default class BcryptService implements IBcryptService {
    private readonly securityConfig: ISecurityConfig;
    public constructor(securityConfig: ISecurityConfig) {
        this.securityConfig = securityConfig;
    }
    async hashPassword(plainPassword: string): Promise<string> {
        const hashedString = await bcrypt.hash(plainPassword, this.securityConfig.BCRYPT_SALT);
        return hashedString;
    }
    async comparePassword(plainPassword: string, hashPassword: string): Promise<boolean> {
        const isValid = await bcrypt.compare(plainPassword, hashPassword);
        return isValid;
    }
}
