import { Record } from "@prisma/client/runtime/library";
import { BaseErrorConstructorParams, DevError } from "./BaseError.types";

export interface ClientErrorConstructorParams extends BaseErrorConstructorParams {
   field:string;
}

export interface ClientErrorDevResponse extends DevError {
   field:string;
}

export interface MissingFieldParam {
   field:string;
   context?:Record<string,any>
}

export interface UnauthorizedCLientParam {
   field:string;
   context?:Record<string,any>
}
