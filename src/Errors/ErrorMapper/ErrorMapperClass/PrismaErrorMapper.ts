import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ErrorMapperClass } from "./ErrorMapperClass.interface";
import { Prisma } from "@prisma/client";
import { DbError,DbErrorFactory } from "../../DbError";

type PrismaError = 
   Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError |
   Prisma.PrismaClientRustPanicError | PrismaClientInitializationError | 
   Prisma.PrismaClientValidationError;

export class PrismaErrorMapper implements ErrorMapperClass<PrismaError, DbError>{
   handle(error:unknown): error is PrismaError{
      return error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError ||
             error instanceof Prisma.PrismaClientRustPanicError || error instanceof PrismaClientInitializationError || 
             error instanceof Prisma.PrismaClientValidationError;
   }
   map(error:PrismaError,context?:any): DbError {
      if(error instanceof Prisma.PrismaClientKnownRequestError) 
         return DbErrorFactory.CreatePrismaClientKnwonRequestError(error);

      if(error instanceof Prisma.PrismaClientUnknownRequestError)
         return DbErrorFactory.CreatePrismaClientUnknownRequestError(error);

      if(error instanceof Prisma.PrismaClientRustPanicError)
         return DbErrorFactory.CreatePrismaClientRustPanicError(error);

      if(error instanceof Prisma.PrismaClientInitializationError)
         return DbErrorFactory.CreatePrismaClientInitializationError(error);
      else{
         return DbErrorFactory.CreatePrismaClientValidationError(error);
      }
   }
}
