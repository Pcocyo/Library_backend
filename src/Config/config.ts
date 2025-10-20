import dotenv from 'dotenv';
dotenv.config();

class Env {
    private PORT: Number;
    private JWTOKEN: String;
    private DB_URL;
    private static instance: Env | null = null;

    private constructor() {
        this.PORT = parseInt(process.env.Port || "3000");

        this.JWTOKEN = process.env.JWT_SECRET || (() => {
            throw new Error('Json Web Token is undefined in environment')
        })()
        this.DB_URL = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME
        }
    }
    public static getInstance(): Env {
        if (!Env.instance) {
            Env.instance = new Env();
            return Env.instance;
        }
        else {
            return Env.instance
        }
    }

    public getDB_URL() {
        return this.DB_URL;
    }
    public getPORT(): Number {
        return this.PORT;
    }
    public getJWTOKEN(): String {
        return this.JWTOKEN;
    }
}
export default Env;

