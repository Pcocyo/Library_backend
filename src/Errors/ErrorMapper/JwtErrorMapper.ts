import jwt from "jsonwebtoken";
import { ErrorMapper } from "./ErrorMapper.interface";
import { ClientError, ClientErrorFactory } from "../ClientError";

type JwtError = jwt.NotBeforeError | jwt.JsonWebTokenError | jwt.TokenExpiredError;

export class JwtErrorMapper implements ErrorMapper<JwtError,ClientError>{

   handle(error:unknown): error is JwtError{
      return error instanceof jwt.NotBeforeError ||
             error instanceof jwt.JsonWebTokenError ||
             error instanceof jwt.TokenExpiredError 
   }

   map(error:jwt.JsonWebTokenError, context?:any):ClientError{
      if(error instanceof jwt.TokenExpiredError){
         return ClientErrorFactory.createUnauthorizedRequestError({
            message:"Unauthorized Request",
            context: {jwtError:{...error},input:context}
         })
      }
      if(error instanceof jwt.NotBeforeError){
         return ClientErrorFactory.createUnauthorizedRequestError({
            message:"Unauthorized Request",
            context: {jwtError:{...error},input:context}
         })
      }
      else{
         return ClientErrorFactory.createUnauthorizedRequestError({
            message:"Unauthorized Request",
            context: {jwtError:{...error},input:context}
         })
      }
   }
}
