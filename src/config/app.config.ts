import { Config } from "./config.interface";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export class AppConfig implements Config {
    readonly PORT: Number;
    readonly JWT_SECRET: string;

    readonly DATABASE: {
        readonly HOST: string;
        readonly PORT: string;
        readonly PASSWORD: string;
        readonly DATABASENAME: string;
        readonly USER: string;
        readonly DATABASE_URL: string;
    };
    constructor() {
        this.PORT = parseInt(process.env.Port || "3000");
        this.JWT_SECRET = process.env.JWT_SECRET || "test secret";
        this.DATABASE = {
            HOST: `${process.env.DB_HOST}`,
            PORT: `${process.env.DB_PORT}`,
            USER: `${process.env.DB_USER}`,
            PASSWORD: `${process.env.DB_PASSWORD}`,
            DATABASENAME: `${process.env.DB_DATABASE_NAME}`,
            DATABASE_URL: `${process.env.DB_ABS_URL}`
        };
    }
}
