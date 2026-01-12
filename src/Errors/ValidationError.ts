import { BaseError } from "./BaseError";
import {
   ValidationErrorDevResponse, ValidationErrorConstructorParam,
   CreateInvalidInputErrorParam
} from "./types";

export enum ValidationErrorCode {
   Invalid_Email_Input = "VALIDATION_ERROR_001",
   Invalid_Password_Input = "VALIDATION_ERROR_002",
   Invalid_UserRole_Input = "VALIDATION_ERROR_003",
   Invalid_Profile_Parameter_Length = "VALIDATION_ERROR_004",
   Invalid_Profile_Parameter_Format = "VALIDATION_ERROR_005",
}

export class ValidationError extends BaseError {
   private readonly field?: string;
   private readonly value?: string;

   constructor(param: ValidationErrorConstructorParam) {
      super({
         message: param.message,
         httpStatusCode: param.httpStatusCode,
         code: param.code,
         isOperational: true,
         context: param.context,
      });
      this.name = "VALIDATION_ERROR";
      this.field = param.field;
      this.value = param.value;
   }

   public toDevResponse():  ValidationErrorDevResponse{
      return {
         ...super.toDevResponse(),
         value: this.value,
         field:this.field
      }
   }
}

export class ValidationErrorFactory{
   public static createInvalidInputError(param:CreateInvalidInputErrorParam): ValidationError{
      return new ValidationError({
         message: `Invalid ${param.field} input`,
         httpStatusCode: 400,
         code: param.code,
         isOperational: true,
         context:param.context,
         field:param.field,
         value:param.value
      })
   }
}
