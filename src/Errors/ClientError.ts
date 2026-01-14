import { BaseError } from "./BaseError";
import { ClientErrorConstructorParams, ClientErrorDevResponse, 
         EmailNotFoundParam, IncorrectPasswordParam,
         InvalidClientRequestParam,
         MissingFieldParam, UnauthorizedCLientParam,
         UserIdNotFoundParam} from "./types";

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
   Unauthorized_Request = "Unauthorized_Request",
   Incorrect_Password = "Incorrect_Password",
   Email_Not_Found = "Email_Not_Found",
   User_Id_Not_Found = "User_Id_Not_Found",
   Invalid_Request = "Invalid_Request"
}

export class ClientErrorFactory {

   public static createUnauthorizedRequestError(param:UnauthorizedCLientParam):ClientError{
      return new ClientError({
         field: "",
         message:param.message,
         httpStatusCode: 401,
         code: ClientErrorCode.Unauthorized_Request,
         isOperational: true,
         context:param.context
      })
   }
   public static createIncorrectPasswordError(param:IncorrectPasswordParam):ClientError{
      return new ClientError({
         field: param.field,
         message:"Password Incorrect",
         httpStatusCode: 401,
         code: ClientErrorCode.Incorrect_Password,
         isOperational: true,
         context:param.context
      })
   }

   public static createEmailNotFoundError(param:EmailNotFoundParam):ClientError{
      return new ClientError({
         field: "email",
         message:"Email Not Found",
         httpStatusCode: 400,
         code: ClientErrorCode.Email_Not_Found,
         isOperational: true,
         context:param.context
      })
   }

   public static createUserIdNotFoundError(param:UserIdNotFoundParam):ClientError{
      return new ClientError({
         field: "user_id",
         message:"user id Not Found",
         httpStatusCode: 400,
         code: ClientErrorCode.User_Id_Not_Found,
         isOperational: true,
         context:param.context
      })
   }

   public static createInvalidClientRequestError(param:InvalidClientRequestParam){
      return new ClientError({
         field:"",
         message:param.message,
         httpStatusCode:400,
         code:ClientErrorCode.Invalid_Request,
         isOperational:true,
         context:param.context
      })
   }
}
