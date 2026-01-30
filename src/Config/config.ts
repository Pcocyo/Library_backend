import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../Controller/User/User";
import type { UserJwtPayloadInterface } from "./config.interface";

dotenv.config({ quiet: true });

class Env {
    private static PORT: Number = parseInt(process.env.Port || "3000");
    private static JWT_SECRET: string = process.env.JWT_SECRET || "Dev secret";
    private static DB_URL = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        databaseName: process.env.DB_DATABASE_NAME,
    };
    private static __Bcrypt_Config = {
        salt: 10,
    };

    public static getDB_URL() {
        return Env.DB_URL;
    }

    public static getPORT(): Number {
        return Env.PORT;
    }

    // jwt token logic
    public static getJWTOKEN(): string {
        return Env.JWT_SECRET;
    }

    public static getGenerateJwtToken(user: User): string {
        const newToken = jwt.sign(
            {
                userEmail: user.getEmail(),
                userRole: user.getUserRole(),
                userId: user.getId(),
            },
            Env.JWT_SECRET,
            { expiresIn: "1h" },
        );
        return newToken;
    }

    public static getValidateToken(jwtToken: string): UserJwtPayloadInterface {
        const userPayload: UserJwtPayloadInterface = jwt.verify(
            jwtToken,
            Env.JWT_SECRET,
        ) as UserJwtPayloadInterface;
        return userPayload;
    }

    // bcrypt logic
    public static async getGenerateBcrypt(
        strPassword: string,
    ): Promise<string> {
        const bcryptStr: string = await bcrypt.hash(
            strPassword,
            Env.__Bcrypt_Config.salt,
        );
        return bcryptStr;
    }

    public static async getValidatePassword(
        strPassword: string,
        hashPassword: string,
    ): Promise<boolean> {
        const isValid: boolean = await bcrypt.compare(
            strPassword,
            hashPassword,
        );
        return isValid;
    }
}
export default Env;
