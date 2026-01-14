import { Request,Response,NextFunction, RequestHandler } from "express";
import { ValidationErrorCode, ValidationErrorFactory } from "../Errors";
import { ClientErrorFactory } from "../Errors";
import { UserRole } from "../Controller/User/User";
import { ProfileStatus, UserUpdateProfileParam } from "../Controller/Profile/Profile.interface";
import { UserJwtPayloadInterface } from "../Config/config.interface";

export class ErrorHandler_Middleware{
   public static ValidateEmailParameter: RequestHandler = (req:Request,res:Response,next:NextFunction)=>{
      try{
         if (req.body.email == undefined){
            throw ClientErrorFactory.createMissingFieldError({
                  field:"email",
                  context:{user_request_info:req.body}
            });
         };
         const emailRegx: RegExp =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
         if(!emailRegx.test(req.body.email)){
            throw ValidationErrorFactory.createInvalidInputError({
               field:"email",
               value:req.body.email,
               context:{user_request_info:req.body},
               message:"Invalid input format",
               code:ValidationErrorCode.Invalid_Email_Input
            })
         }
         next();
      }
      catch(error:any){
         next(error);
      }
   }

   public static ValidatePasswordParameter: RequestHandler = (req:Request,res:Response, next:NextFunction)=>{
      try{
         if(req.body.password == undefined){
            throw ClientErrorFactory.createMissingFieldError({
               field:"password",
               context:{user_request_info:req.body}
            });
         }
         const passwordRegex:RegExp = 
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;
         if(!passwordRegex.test(req.body.password)){
            throw ValidationErrorFactory.createInvalidInputError({
               field:"password",
               value:req.body.password,
               context:{user_request_info:req.body},
               message:"Invalid password format. (password must contain at most 32 characther, a number and a symbol))",
               code:ValidationErrorCode.Invalid_Password_Input
            })
         };
         next();
      }catch(error:any){
         next(error);
      }
   }

   public static ValidateUserRoleParameter: RequestHandler = (req:Request,res:Response, next:NextFunction)=>{
      try{
         if(req.body.userRole == undefined){
            throw ClientErrorFactory.createMissingFieldError({
               field:"userRole",
               context:{user_request_info:req.body}
            });
         }
         if (!UserRole[req.body.userRole as keyof typeof UserRole]) {
            throw ValidationErrorFactory.createInvalidInputError({
               field:"userRole",
               value:req.body.userRole,
               context:{user_request_info:req.body},
               message:"Invalid user role input",
               code:ValidationErrorCode.Invalid_UserRole_Input
            })
         }
         next();
      }catch(error:any){
         next(error);
      }
   }

   public static ValidatePofileUptadeInput: RequestHandler= (req: Request, res:Response, next:NextFunction)=>{
      const userParam:(keyof UserUpdateProfileParam)[] = ["user_name","first_name","last_name","contact","address"];
      const userInput:UserUpdateProfileParam = req.body;
      const validators = {
         user_name:(user_name:string)=>{
            if(user_name.length < 3) {
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"user_name",
                  value:user_name,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Length,
                  message:"Username must be more than 3 characther",
                  context:{user_input_data:req.body, reason:"user_name invalid format"}
               })
            }
            if(!/^[a-zA-Z-1-9_]+$/.test(user_name)) {
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"user_name",
                  value:user_name,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Username must cannot contain any symbol",
                  context:{user_input_data:req.body, reason:"user_name invalid format"}
               });
            }
         },
         first_name:(first_name:string)=>{
            if(first_name.length < 3) 
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"first_name",
                  value:first_name,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Length,
                  message:"First name must be more than 3 characther",
                  context:{user_input_data:req.body,reason:"name length less than 3"}
               });
         },
         last_name:(last_name:string)=>{
            if(last_name.length < 3) 
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"last_name",
                  value:last_name,
                  message:"Last name must be more than 3 characther",
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Length,
                  context:{user_input_data:req.body,reason:"name length less than 3"}
               });
         },
         contact:(contact:string)=>{
            if(contact.length < 7 || contact.length > 15){
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"contact",
                  value:contact,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Length,
                  message:"Contact must be less than 7 or more than 15 characther",
                  context:{user_input_data:req.body}
               })
            }
            if(!/^[0-9]+$/.test(contact)) {
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"contact",
                  value:contact,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Contact contain non-numeric characther",
                  context:{user_input_data:req.body,}
               })
            };
         },
         address:(address:string)=>{
            if(address.length < 3) 
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"address",
                  value:address,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Length,
                  message:"address characther length is less than 3",
                  context:{user_input_data:req.body}
               });
         },
      }
      try{
         for(let param of userParam){
            const value = req.body[param];
            if(userInput[param]=== null) continue;
            if(userInput[param] === undefined) {
               throw ClientErrorFactory.createMissingFieldError({
                  field:`${param}`,
                  context:{user_request_info:req.body}
               });
            }; 
            validators[param as keyof typeof validators](value as string)
         }
         next();
      }catch(error:any){
         next(error);
      }
   }

   public static ValidateLibrarianUpdateProfileInput: RequestHandler= (req:Request,res:Response,next:NextFunction) => {
      const librarianRequiredParam = ["status","total_fines","email"];
      const validators = {
         "total_fines":(input:string)=>{
            if(!/^\d{1,10}\.\d+$/.test(`${input}`)){
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"total_fines",
                  value:input,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Invalid total fines input format"
               })
            }
         },
         "status":(input:string)=>{
            if(!(input in ProfileStatus)){
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"status",
                  value:input,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Invalid profile status input format"
               })
            }
         },
         "email":(input:string)=>{
            const emailRegx: RegExp =
               /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegx.test(input)) {
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"email",
                  value:input,
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Invalid email input format"
               })
            }
         }
      }

     try {
        for(let param of librarianRequiredParam){
            if(req.body[param] === undefined) {
               throw ClientErrorFactory.createMissingFieldError({
                  field:String(param),
                  context: {user_input_data:req.body},
               })
            }
            if(param === "email" && req.body[param] === null) {
               throw ValidationErrorFactory.createInvalidInputError({
                  field:"email",
                  value:req.body[param],
                  code:ValidationErrorCode.Invalid_Profile_Parameter_Format,
                  message:"Email cannot recive value null"
               })
            };
            if(req.body[param] === null) continue;
            validators[param as keyof typeof validators](req.body[param] as string);
         }
         next()
      } catch (error:any){
         next(error);
      }
   }
   
   public static ValidateMemberStatus: RequestHandler = (req:Request,res:Response,next:NextFunction)=>{
      try{
         let userData:UserJwtPayloadInterface = req.body.authorizedUser
         if(userData.userRole !== "GUEST") throw ClientErrorFactory.createInvalidClientRequestError({
            context:req.body,
            message:"User status is not a guest"
         })
         next()
      }catch(error:any){
         next(error);
      }
   }
}
