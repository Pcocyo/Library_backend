import { HttpsStatusCode } from "./httpsStatusCode.types";
import { DevErrorResponse } from "./BaseError.types";

export interface DbErrorConstructorParams {
   message:string,
   httpsStatusCode: HttpsStatusCode,
   context? : Record<string,any>,
   code: string,
   field:string,
}

export interface DbErrorDevResponse extends DevErrorResponse{
   field:string;
}
