import { HttpsStatusCode } from "./httpsStatusCode.types";

//    message: string,              // User-friendly message
//    httpStatusCode: number,       // 400, 404, 500, etc.
//    code: string,                 // "VALIDATION_ERROR", "AUTH_FAILED"
//    isOperational: boolean = true, // Default to operational errors
//    context?: Record<string, any> 

export interface BaseErrorConstructorParams {
   message: string;
   httpStatusCode: HttpsStatusCode;
   code: string;
   isOperational: boolean;
   context?: Record<string,any>;
}

export interface ClientError{
   name: string;
   message: string;
   code: string;
   statusCode: HttpsStatusCode;
   timestamp: string;
}

export interface DevError{
   name: string;
   message: string;
   code: string;
   statusCode: HttpsStatusCode;
   stack?: string;
   timestamp: string;
   context?: Record<string,any>;
   isOperational: boolean;
   field?:string,
   value?:any
}
