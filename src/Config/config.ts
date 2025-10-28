import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { hashSync } from "bcrypt";

import User, { UserRole } from "../../src/Controller/User/User.ts";
import type { UserJwtPayloadInterface } from "./config.interface.ts";

dotenv.config();

class Env {
    private PORT: Number;
    private JWT_SECRET: string;
    private DB_URL;
    private static instance: Env | null = null;
    private static __Bcrypt_Config = {
        salt: 10,
    };

    private constructor() {
        this.PORT = parseInt(process.env.Port || "3000");
        this.JWT_SECRET = process.env.JWT_SECRET || "Dev secret";
        this.DB_URL = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            databaseName: process.env.DB_DATABASE_NAME,
        };
    }

    public static getInstance(): Env {
        if (!Env.instance) {
            Env.instance = new Env();
            return Env.instance;
        } else {
            return Env.instance;
        }
    }

    public getDB_URL() {
        return this.DB_URL;
    }

    public getPORT(): Number {
        return this.PORT;
    }

    // jwt token logic
    public getJWTOKEN(): string {
        return this.JWT_SECRET;
    }

    public getGenerateJwtToken(user: User): string {
        const newToken = jwt.sign(
            { userEmail: user.getEmail(), userRole: user.getUserRole() },
            this.JWT_SECRET,
            { expiresIn: "1h" },
        );
        return newToken;
    }

    public getValidateToken(jwtToken: string): UserJwtPayloadInterface {
        const userPayload: UserJwtPayloadInterface = jwt.verify(
            jwtToken,
            this.JWT_SECRET,
        ) as UserJwtPayloadInterface;
        return userPayload;
    }

    // bcrypt logic

    public async getGenerateBcrypt(strPassword: string): Promise<string> {
       const bcryptStr :string = await bcrypt.hash(strPassword, Env.__Bcrypt_Config.salt)
       return bcryptStr
    }

    public async getValidatePassword(
        strPassword: string,
        hashPassword: string,
    ): Promise<boolean> {

        const isValid :boolean = await bcrypt.compare(strPassword,hashPassword)
        return isValid
    }
}
export default Env;
