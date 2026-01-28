import { beforeEach } from "node:test";
import { BaseErrorConstructorParams } from "../../src/Errors/ErrorClass/types";
import { BaseError } from "../../src/Errors/ErrorClass"
class BaseErrorTest extends BaseError{};

   //message: string;
   //httpStatusCode: HttpsStatusCode;
   //code: string;
   //isOperational: boolean;
   //context?: Record<string,any>;

describe("BaseError test suite",()=>{
   const message = "Test message";
   const httpStatusCode = 200;
   const code = "Invalid parameter";
   const isOperational = true;
   const context = {
      "message":"test"
   };

   const baseErrorInstanceParam:BaseErrorConstructorParams = {
      message: message,
      httpStatusCode: httpStatusCode,
      code: code,
      isOperational: isOperational,
      context: context
   };

   it("Should correctly populate all properties including message, status code, error code, operational flag, and context",()=>{
      try{
         throw new BaseErrorTest(baseErrorInstanceParam)
      }catch(error:any){
         expect(error.message).toBe("Test message");
         expect(error.httpsStatusCode).toBe(200);
         expect(error.code).toBe("Invalid parameter");
         expect(error.isOperational).toBe(true);
         expect(error.context).toHaveProperty("message");
      }
   })
   
   it("Any class inherited from BaseError abstract class should be instances of both Error and BaseError",()=>{
      try{
         throw new BaseErrorTest(baseErrorInstanceParam)
      }catch(error:any){
         expect(error instanceof Error).toBeTruthy();
         expect(error instanceof BaseError).toBeTruthy();
      }
   })

   it("BaseError.toClientResponse should return a structured client response with all required properties",()=>{
      try{
         throw new BaseErrorTest(baseErrorInstanceParam)
      }catch(error:any){
         error = error.toClientResponse()
         expect(error).toHaveProperty("name");
         expect(error).toHaveProperty("message");
         expect(error).toHaveProperty("statusCode");
         expect(error).toHaveProperty("code");
         expect(error).toHaveProperty("timestamp");
      }
   })

   it("BaseError.toDevResponse should return a structured developer response with all required properties",()=>{
      try{
         throw new BaseErrorTest(baseErrorInstanceParam)
      }catch(error:any){
         error = error.toDevResponse();
         expect(error).toHaveProperty("name");
         expect(error).toHaveProperty("message");
         expect(error).toHaveProperty("statusCode");
         expect(error).toHaveProperty("code");
         expect(error).toHaveProperty("timestamp");
         expect(error).toHaveProperty("stack");
         expect(error).toHaveProperty("context");
         expect(error).toHaveProperty("isOperational");
      }
   })

})
