import { BaseErrorConstructorParams, DevErrorResponse } from "./BaseError.types"
import { ValidationErrorCode } from "../ValidationError"
export interface ValidationErrorConstructorParam extends BaseErrorConstructorParams{
   field?: string,
   value?: any
}

export interface ValidationErrorDevResponse extends DevErrorResponse{
   field?: string,
   value?: any
}

export interface CreateInvalidInputErrorParam{
   field: string;
   value: any;
   message:string;
   context?: Record<string,any>;
   code: ValidationErrorCode;
};
