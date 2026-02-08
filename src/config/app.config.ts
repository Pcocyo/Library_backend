import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { IAppConfig,ISecurityConfig,IDataBaseConfig,IServerConfig } from "./config.interface";

export default class AppConfig implements IAppConfig {
    readonly ServerConfig: IServerConfig;
    readonly SecurityConfig: ISecurityConfig;
    readonly DatabaseConfig: IDataBaseConfig;

    constructor() {
        this.ServerConfig = {PORT: parseInt(process.env.Port || "3000")};
        this.SecurityConfig = {JWT_SECRET: process.env.JWT_SECRET || "test secret"}
        this.DatabaseConfig = {
            HOST: `${process.env.DB_HOST}`,
            PORT: `${process.env.DB_PORT}`,
            USER: `${process.env.DB_USER}`,
            PASSWORD: `${process.env.DB_PASSWORD}`,
            DATABASENAME: `${process.env.DB_DATABASE_NAME}`,
            DATABASE_URL: `${process.env.DB_ABS_URL}`,
        };
    }

    getServerConfig(): IServerConfig{
      return this.ServerConfig;

   };
    getDataBaseConfig(): IDataBaseConfig{
      return this.DatabaseConfig;
   };
    getSecurityConfig(): ISecurityConfig{
      return this.SecurityConfig;
   };
}
