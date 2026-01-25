import { BaseError } from "./BaseError";
import { DbErrorConstructorParams, DbErrorDevResponse } from "./types";
export class DbError extends BaseError {
   private readonly field: string;
   
   constructor(param: DbErrorConstructorParams){
      super(
         {
            message: param.message,
            isOperational: true,
            httpStatusCode:param.httpsStatusCode,
            code:param.code,
            context:param.context
         }
      )
      this.field = param.field;
   }
   public toDevResponse(): DbErrorDevResponse{
      return {...super.toDevResponse(),
         field: this.field
      }
   }   
}
