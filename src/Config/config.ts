import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

class Env {
  private PORT: Number;
  private JWT_SECRET: String;
  private DB_URL;
  private static instance: Env | null = null;

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

  // jwt token not yet configured
  public getJWTOKEN(): String {
    // sign with jwt.sign
    return this.JWT_SECRET;
  }

  //verify with jwt.verify
  //test with try catcg for synchronous coding
  // public generateJwtToken(): String {
  //      jwt.sign(this.JWT_SECRET)

  // }
}
export default Env;
