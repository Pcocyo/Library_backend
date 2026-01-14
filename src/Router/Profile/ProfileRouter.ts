import { RouterClass } from "../Ultils/RouterClass";
import { NextFunction, Request,Response } from "express";
import Profile from "../../Controller/Profile/Profile";
import User, {UserRole} from "../../Controller/User/User";
import { UserUpdateProfileParam, } from "../../Controller/Profile/Profile.interface";
import { ProfileUpdateRequest,LibrarianUpdateUserProfileRequest } from "./ProfileRouter.types";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { ErrorHandler_Middleware } from "../../Middleware";

export class ProfileRouter extends RouterClass{
   public constructor(){
      super();
      this.initializeRoutes();
   }

   protected initializeRoutes(){
      this.router.get("/getProfile",
         this.validateToken,
         (req:Request,res:Response,next:NextFunction)=>{
            this.getProfile(req,res,next);
         })

      this.router.patch("/update",
         this.validateToken,
         ErrorHandler_Middleware.ValidatePofileUptadeInput,
         (req:ProfileUpdateRequest,res:Response,next:NextFunction)=>{
            this.updateUserProfile(req,res,next);
         })

      this.router.patch("/subscribe",
         this.validateToken,
         ErrorHandler_Middleware.ValidateMemberStatus,
         (req:Request,res:Response,next:NextFunction)=>{
            this.subscribe(req,res,next);
         }
      )

      this.router.patch("/librarian/update",
         this.validateLibrarianToken,
         ErrorHandler_Middleware.ValidateLibrarianUpdateProfileInput,
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
      const userParam:(keyof UserUpdateProfileParam)[] = ["user_name","first_name","last_name","contact","address"];
      try{
         const userProfile:Profile = await Profile.GetByUserId({user_id:req.body.authorizedUser.userId});

         const updates = {
            "user_name":(input:string | null)=>{
               userProfile.set_userName(input)
            },
            "first_name":(input:string | null)=>{
               userProfile.set_firstName(input)
            },
            "last_name":(input:string | null)=>{
               userProfile.set_lastName(input)
            },
            "contact":(input:string | null)=>{
               userProfile.set_contact(input)
            },
            "address":(input:string | null)=>{
               userProfile.set_address(input)
            }
         }
         for(let param of userParam){
            const input = req.body[param];
            updates[param as keyof typeof updates ](input as string | null);
         }

         //update profile.update_at data
         const updateDate = new Date;
         userProfile.set_updatedAt(updateDate);
         res.status(200).json({message:`Profile for user ${req.body.authorizedUser.userId} successfully updated on ${updateDate}`});
      }catch(error:any){
         next(error);
      }
   }

   private async librarianUpdateUserProfile(req:LibrarianUpdateUserProfileRequest,res:Response,next:NextFunction){
      const userToUpdate:User = await User.getUserByEmail({email:req.body.email})
      const userProfile:Profile = await Profile.GetByUserId({user_id:userToUpdate.getId()});
      try{
         userProfile.set_fines(req.body.total_fines as number);
         userProfile.set_status(req.body.status);
         res.status(200).json({message:"success"});
      }catch(error: any){
         next(error);
      }
   }

   private async subscribe(req:Request,res:Response,next:NextFunction){
      try{
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
