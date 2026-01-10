import { BaseErrorConstructorParams, DevErrorResponse } from "./BaseError.types";

export interface ClientErrorConstructorParams extends BaseErrorConstructorParams {
   field:string;
}

export interface ClientErrorDevResponse extends DevErrorResponse {
   field:string;
}

export interface MissingFieldParam {
   field:string;
   context?:Record<string,any>
}

export interface UnauthorizedCLientParam {
   context?:Record<string,any>
}

export interface IncorrectPasswordParam {
   field:string,
   context?:Record<string,any>
}

export interface EmailNotFoundParam {
   context?:Record<string,any>
}

export interface UserIdNotFoundParam {
   context?:Record<string,any>
}

