import { RouterClass } from "../Ultils/RouterClass";
import { NextFunction, Request,Response } from "express";
import Profile from "../../Controller/Profile/Profile";
import User, {UserRole} from "../../Controller/User/User";
import { UserUpdateProfileParam, } from "../../Controller/Profile/Profile.interface";
import { ProfileUpdateRequest,LibrarianUpdateUserProfileRequest } from "./ProfileRouter.types";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { LibrarianUpdateProfileRequestSchema, ProfileUpdateRequestSchema } from "../../Middleware/validation-handler/schema";
import { ClientErrorFactory } from "../../Errors";
import { validate } from "../../Middleware/validation-handler";
import { keyof } from "zod";

export class ProfileRouter extends RouterClass{
   public constructor(){
      super();
      this.initializeRoutes();
   }

   protected initializeRoutes(){
      this.router.get("/get",
         this.validateToken,
         (req:Request,res:Response,next:NextFunction)=>{
            this.getProfile(req,res,next);
         })

      this.router.patch("/update",
         this.validateToken,
         validate(ProfileUpdateRequestSchema),
         (req:ProfileUpdateRequest,res:Response,next:NextFunction)=>{
            this.updateUserProfile(req,res,next);
         })

      this.router.patch("/subscribe",
         this.validateToken,
         (req:Request,res:Response,next:NextFunction)=>{
            this.subscribe(req,res,next);
         }
      )

      this.router.patch("/librarian/update",
         this.validateLibrarianToken,
         validate(LibrarianUpdateProfileRequestSchema),
         (req:Request,res:Response,next:NextFunction) =>{
            this.librarianUpdateUserProfile(req,res,next);
         }
      )
   }

   private async getProfile(req:Request,res:Response,next:NextFunction){
      const userData:UserJwtPayloadInterface = req.body.authorizedUser;
      try {
         const userProfile:Profile = await Profile.GetByUserId({user_id:userData.userId});
         res.send({
            user_id:userData.userId,
            user_name: userProfile.get_userName(),
            first_name:userProfile.get_firstName(),
            last_name:userProfile.get_lastName(),
            contact:userProfile.get_contact(),
            address:userProfile.get_address(),
            membership_date:userProfile.get_memberDate(),
            status:userProfile.get_status(),
            total_fines:userProfile.get_totalFines(),
            updated_at:userProfile.get_updatedAt(),
         })
      } catch (error:any) {
         next(error);
      }
   }
   
   private async updateUserProfile(req:ProfileUpdateRequest,res:Response,next:NextFunction){
      try{
         const userProfile:Profile = await Profile.GetByUserId({user_id:req.body.authorizedUser.userId});

         const profileUpdateMapper:Record<keyof UserUpdateProfileParam, (value:string|null)=>void> = {
            "user_name":(input:string | null)=>{
               if(input == userProfile.get_userName()){
                  return
               }
               userProfile.set_userName(input)
               userProfile.set_updatedAt(new Date);
               return
            },
            "first_name":(input:string | null)=> {
               if(input == userProfile.get_firstName()){
                  return
               }
               userProfile.set_firstName(input)
               userProfile.set_updatedAt(new Date);
               return
            },
            "last_name":(input:string | null)=> {
               if(input == userProfile.get_lastName()){
                  return
               }
               userProfile.set_lastName(input)
               userProfile.set_updatedAt(new Date);
               return
            },
            "contact":(input:string | null)=> {
               if(input == userProfile.get_contact()){
                  return
               }
               userProfile.set_contact(input)
               userProfile.set_updatedAt(new Date);
               return
            },
            "address":(input:string | null)=> {
               if(input == userProfile.get_address()){
                  return
               }
               userProfile.set_address(input)
               userProfile.set_updatedAt(new Date);
               return
            },
         }

         for(const [field,setter] of Object.entries(profileUpdateMapper)){
            if(field in req.body){
               const value = req.body[field as keyof typeof req.body]
               setter(value as string);
            }
         }

         res.status(200).json({message:`Update success`});
      }catch(error:any){
         next(error);
      }
   }

   private async librarianUpdateUserProfile(req:LibrarianUpdateUserProfileRequest,res:Response,next:NextFunction){
      const userToUpdate:User = await User.getUserByEmail({email:req.body.email})
      const userProfile:Profile = await Profile.GetByUserId({user_id:userToUpdate.getId()});
      try{
         userProfile.set_fines(req.body.total_fines);
         userProfile.set_status(req.body.status);
         res.status(200).json({message:"success"});
      }catch(error: any){
         next(error);
      }
   }

   private async subscribe(req:Request,res:Response,next:NextFunction){
      try{
         if(req.body.authorizedUser.userRole !== "GUEST") throw ClientErrorFactory.createInvalidClientRequestError({
            context:req.body,
            message:"User status is not a guest"
         })
         const userData:UserJwtPayloadInterface = req.body.authorizedUser;
         const user:User = await User.getUserByEmail({email:userData.userEmail});
         const profile:Profile = await Profile.GetByUserId({user_id:userData.userId});
         user.setRole(UserRole.MEMBER);
         profile.set_memberDate(new Date);
         res.status(200).send({message:`User ${userData.userEmail} successfully subscribed`});
      }catch(error:any){
         next(error);
      }
   }
}
