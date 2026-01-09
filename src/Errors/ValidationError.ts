import { BaseError } from "./BaseError";
import {
   ValidationErrorDevResponse, ValidationErrorConstructorParam
} from "./types";

class ValidationError extends BaseError {
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
         ...this.toDevResponse(),
         value: this.value,
         field:this.field
      }
   }
}

export class ValidattionErrorFactory{

}
