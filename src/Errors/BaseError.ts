import { BaseErrorConstructorParams, ClientErrorResponse, DevErrorResponse } from "./types";
import { HttpsStatusCode } from "./types";

export abstract class BaseError extends Error{
   public readonly message:string;
   public readonly httpsStatusCode:HttpsStatusCode;
   public readonly code:string;
   public readonly isOperational:boolean;
   public readonly context?: Record<string,any>;
   public readonly timestamp: Date; 


   constructor(param:BaseErrorConstructorParams){
      super(param.message);

      // Fix instance inheritence 
      Object.setPrototypeOf(this,new.target.prototype);
      
      // Skip stack frame from BaseError
      if(Error.captureStackTrace){
         Error.captureStackTrace(this,this.constructor);
      }

      this.httpsStatusCode = param.httpStatusCode;
      this.message = param.message;
      this.code = param.code;
      this.isOperational = param.isOperational;
      this.context = param.context;
      this.timestamp = new Date();
      this.name = this.constructor.name;
   }
   
   // For client error logs
   public toClientResponse(): ClientErrorResponse{
      return{
         name: this.name,
         message:this.message,
         code:this.code,
         statusCode:this.httpsStatusCode,
         timestamp:this.timestamp.toISOString()
      }
   }
   
   // For developer error logs
   public toDevResponse(): DevErrorResponse{
      return{
         name: this.name,
         message:this.message,
         code:this.code,
         statusCode:this.httpsStatusCode,
         stack:this.stack,
         timestamp:this.timestamp.toISOString(),
         context:this.context,
         isOperational: this.isOperational,
      } 
   }
}
