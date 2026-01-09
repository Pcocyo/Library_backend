import { BaseErrorConstructorParams, DevError } from "./BaseError.types"

export interface ValidationErrorConstructorParam extends BaseErrorConstructorParams{
   field?: string,
   value?: any
}
export interface ValidationErrorDevResponse extends DevError{
   field?: string,
   value?: any
}
