import { BaseError } from "./BaseError";
import { DbErrorConstructorParams, DbErrorDevResponse } from "./types";
import { Prisma } from "@prisma/client";

export class DbError extends BaseError {
   private readonly field: string;
   
   constructor(param: DbErrorConstructorParams){
      super(
         {
            message: param.message,
            isOperational: param.isOperational,
            httpStatusCode:param.httpsStatusCode,
            code:param.code,
            context:param.context
         }
      )
      this.field = param.field;
      this.name = "DATABASE_ERROR";
   }
   public toDevResponse(): DbErrorDevResponse{
      return {...super.toDevResponse(),
         field: this.field
      }
   }   
}

export class DbErrorFactory{
   public static CreatePrismaClientKnwonRequestError(error:Prisma.PrismaClientKnownRequestError):DbError{
      return new DbError({
         message:`${error.message} ${error.name}`,
         httpsStatusCode: 400,
         code:error.code,
         isOperational:true,
         context: { meta: error.meta, cause: error.cause, prismaClientVersion: error.clientVersion },
         field: error.meta?.target as string,
      })
   }

   public static CreatePrismaClientUnknownRequestError(error: Prisma.PrismaClientUnknownRequestError):DbError{
      return new DbError({
               message:error.message,
               httpsStatusCode: 400,
               code:`undefined ${error.name}`,
               isOperational:true,
               context: { cause: error.cause, prismaClientVersion: error.clientVersion },
               field:error.cause as string,
            })
   }
   
   public static CreatePrismaClientRustPanicError(error:Prisma.PrismaClientRustPanicError):DbError{
      return new DbError({
         message:`Internal Server Error`,
         httpsStatusCode: 500,
         isOperational:false,
         code:`undefined ${error.name}`,
         context:{cause:error.cause, message:error.message},
         field:"undefined",
      })
   }

   public static CreatePrismaClientInitializationError(error:Prisma.PrismaClientInitializationError):DbError{
       return new DbError({
         message:`Internal Server Error`,
         isOperational:false,
         httpsStatusCode: 500,
         code:`undefined ${error.name}`,
         context:{
            cause:error.cause, message:error.message, 
            errorCode: error.errorCode, retryStatus:error.retryable,
            prismaClientVersion: error.clientVersion },
         field:"undefined",
      })

   }
   public static CreatePrismaClientValidationError(error:Prisma.PrismaClientValidationError):DbError{
      return new DbError({
         message:"Internal Server Error",
         isOperational:false,
         httpsStatusCode: 500,
         code:`undefined ${error.name}`,
         context:{ cause:error.cause, message:error.message },
         field:"undefined",
      })

   }
}
