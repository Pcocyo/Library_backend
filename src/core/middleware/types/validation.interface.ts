import z from "zod"
import { Request,Response,NextFunction } from "express"
export interface IValidationMiddleware{
   validate <T extends z.ZodSchema>(schema:T): (req:Request, res:Response,next:NextFunction) => void;
}
