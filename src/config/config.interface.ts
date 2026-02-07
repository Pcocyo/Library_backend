export interface Config {
    readonly PORT: Number;
    readonly JWT_SECRET: string;

    readonly DATABASE: {
        readonly HOST: string;
        readonly PORT: string;
        readonly PASSWORD: string;
        readonly DATABASENAME: string;
        readonly USER: string;
        readonly DATABASE_URL: string
    };

}
