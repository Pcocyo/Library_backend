import { BaseErrorConstructorParams, DevError } from "./BaseError.types";

export interface ClientErrorConstructorParams extends BaseErrorConstructorParams {
   field:string;
}

export interface ClientErrorDevResponse extends DevError {
   field:string;
}
