export interface IServerConfig{
   readonly PORT: number;
}

export interface ISecurityConfig{
    readonly JWT_SECRET: string;
    readonly BCRYPT_SALT: number;
}

export interface IDataBaseConfig{
        readonly HOST: string;
        readonly PORT: string;
        readonly PASSWORD: string;
        readonly DATABASENAME: string;
        readonly USER: string;
        readonly DATABASE_URL: string
}

export interface IAppConfig{
   readonly ServerConfig: IServerConfig;
   readonly SecurityConfig: ISecurityConfig;
   readonly DatabaseConfig: IDataBaseConfig;

   getServerConfig(): IServerConfig;
   getDataBaseConfig():IDataBaseConfig;
   getSecurityConfig(): ISecurityConfig;
}
