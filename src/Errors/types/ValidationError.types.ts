import { ClientErrorStatusCode } from "./httpsStatusCode.types"

export interface ValidationErrorConstructorParam {
   message: string,
   code: string,
   httpErrorCode: ClientErrorStatusCode
   context?: Record<string,any>
   field?: string,
   value?: any
}
