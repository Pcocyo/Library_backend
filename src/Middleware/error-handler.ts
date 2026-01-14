import { Request,Response,NextFunction } from "express";
import { ClientError, ValidationError } from "../Errors";

export const errorHandler = (
   err:Error,
   req:Request,
   res:Response,
   next:NextFunction
) => 
   {
   if(err instanceof ClientError){
      return res.status(err.httpsStatusCode).send(err.toClientResponse());
   }
   if(err instanceof ValidationError){
      return res.status(err.httpsStatusCode).send(err.toClientResponse());
   }
   res.status(500).json({error:"Internal server error"});
}
