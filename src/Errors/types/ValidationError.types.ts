import { BaseErrorConstructorParams, DevErrorResponse } from "./BaseError.types"

export interface ValidationErrorConstructorParam extends BaseErrorConstructorParams{
   field?: string,
   value?: any
}
export interface ValidationErrorDevResponse extends DevErrorResponse{
   field?: string,
   value?: any
}
