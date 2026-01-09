import { BaseError } from "./BaseError";
import { ClientErrorConstructorParams, ClientErrorDevResponse} from "./types";

export class ClientError extends BaseError{
   private readonly field:string;

   constructor(param:ClientErrorConstructorParams){
      super({
         message: param.message,
         httpStatusCode: param.httpStatusCode,
         code: param.code,
         isOperational: true,
         context: param.context,
      })
      this.field = param.field;
   }

   public toDevResponse(): ClientErrorDevResponse{
      return {
         ...this.toDevResponse(),
         field:this.field
      }
   }
}
