import { Request,Response,NextFunction, RequestHandler } from "express";
import { ValidationError, ValidationErrorCode, ValidationErrorFactory } from "../Errors";
import { ClientErrorFactory } from "../Errors";
import { ClientError } from "../Errors";
import { ClientErrorResponse } from "../Errors/types";

export class ErrorHandler_Middleware{
   public static ValidateEmailParameter: RequestHandler = (req:Request,res:Response,next:NextFunction)=>{
      try{
         if (req.body.email == undefined){
            throw ClientErrorFactory.createMissingFieldError({
                  field:"email",
                  context:{user_request_info:req.body}
            });
         };
         const emailRegx: RegExp =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
         if(!emailRegx.test(req.body.email)){
            throw ValidationErrorFactory.createInvalidInputError({
               field:"email",
               value:req.body.email,
               context:{user_request_info:req.body},
               code:ValidationErrorCode.Invalid_Email_Input
            })
         }
         next();
      }catch(error:any){
         if(error instanceof ClientError){
            const clientResponse:ClientErrorResponse = error.toClientResponse()
            res.status(clientResponse.statusCode).json({...clientResponse});
         };

         if(error instanceof ValidationError){
            const clientResponse:ClientErrorResponse = error.toClientResponse()
            res.status(clientResponse.statusCode).json({...clientResponse});
         };
         res.json({...error.toClientResponse()});
      }
   }

   public static ValidatePasswordParameter: RequestHandler = (req:Request,res:Response, next:NextFunction)=>{
      try{
         if(req.body.password == undefined){
            throw ClientErrorFactory.createMissingFieldError({
               field:"password",
               context:{user_request_info:req.body}
            });
         }
         const passwordRegex:RegExp = 
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;
         if(!passwordRegex.test(req.body.password)){
            throw ValidationErrorFactory.createInvalidInputError({
               field:"password",
               value:req.body.password,
               context:{user_request_info:req.body},
               code:ValidationErrorCode.Invalid_Password_Input
            })
         };
         next();
      }catch(error:any){
         if(error instanceof ClientError){
            const clientResponse:ClientErrorResponse = error.toClientResponse()
            res.status(clientResponse.statusCode).json({...clientResponse});
         };

         if(error instanceof ValidationError){
            const clientResponse:ClientErrorResponse = error.toClientResponse()
            res.status(clientResponse.statusCode).json({...clientResponse});
         };
         res.json({...error.toClientResponse()});
      }
   }
}
