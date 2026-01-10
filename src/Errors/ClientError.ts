import { BaseError } from "./BaseError";
import { ClientErrorConstructorParams, ClientErrorDevResponse, MissingFieldParam, UnauthorizedCLientParam} from "./types";

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
      this.name = "CLIENT_ERROR"
      this.field = param.field;
   }

   public toDevResponse(): ClientErrorDevResponse{
      return {
         ...super.toDevResponse(),
         field:this.field
      }
   }
}

export enum ClientErrorCode {
   Missing_Parameter = "CLIENT_ERROR_001",
   Unauthorized_Request = "CLIENT_ERROR_002"
}

export class ClientErrorFactory {

   public static createMissingFieldError(param:MissingFieldParam):ClientError{
      return new ClientError({
         field: param.field,
         message:`Missing ${param.field} parameter`,
         httpStatusCode: 400,
         code: ClientErrorCode.Missing_Parameter,
         isOperational: true,
         context: param.context,
      })
   }

   public static createUnauthorizedRequestError(param:UnauthorizedCLientParam):ClientError{
      return new ClientError({
         field: "",
         message:"Unauthorized Request",
         httpStatusCode: 401,
         code: ClientErrorCode.Unauthorized_Request,
         isOperational: true,
         context:param.context
      })
   }
}
