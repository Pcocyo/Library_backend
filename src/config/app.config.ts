import dotenv from "dotenv";
dotenv.config({ quiet: true });
import {
    IAppConfig,
    ISecurityConfig,
    IDataBaseConfig,
    IServerConfig,
} from "./config.interface";

export default class AppConfig implements IAppConfig {
    readonly ServerConfig: IServerConfig;
    readonly SecurityConfig: ISecurityConfig;
    readonly DatabaseConfig: IDataBaseConfig;

    constructor(testStatus?: boolean) {
        this.ServerConfig = testStatus
            ? { PORT: parseInt(process.env.Port || "3000") }
            : { PORT: 3000 };
        this.SecurityConfig = testStatus
            ? {
                  JWT_SECRET: process.env.JWT_SECRET || "test secret",
                  BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT || "10"),
              }
            : {
                  JWT_SECRET: "test secrets",
                  BCRYPT_SALT: 10,
              };
        this.DatabaseConfig = testStatus
            ? {
                  HOST: `${process.env.DB_HOST}`,
                  PORT: `${process.env.DB_PORT}`,
                  USER: `${process.env.DB_USER}`,
                  PASSWORD: `${process.env.DB_PASSWORD}`,
                  DATABASENAME: `${process.env.DB_DATABASE_NAME}`,
                  DATABASE_URL: `${process.env.DB_ABS_URL}`,
              }
            : {
                  HOST: `Not configured`,
                  PORT: `Not configured`,
                  USER: `Not configured`,
                  PASSWORD: `Not configured`,
                  DATABASENAME: `Not configured`,
                  DATABASE_URL: `Not configured`,
              };
    }

    getServerConfig(): IServerConfig {
        return this.ServerConfig;
    }
    getDataBaseConfig(): IDataBaseConfig {
        return this.DatabaseConfig;
    }
    getSecurityConfig(): ISecurityConfig {
        return this.SecurityConfig;
    }

    /** @internal*/
    public static __genTestAppConfig(): AppConfig {
        return new AppConfig(true);
    }
}
