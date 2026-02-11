import dotenv from "dotenv";
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
}
export default Env;
