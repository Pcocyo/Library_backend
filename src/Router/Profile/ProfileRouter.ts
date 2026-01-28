import { RouterClass } from "../Ultils/RouterClass";
import { NextFunction, Request,Response } from "express";
import Profile from "../../Controller/Profile/Profile";
import User, {UserRole} from "../../Controller/User/User";
import { UserUpdateProfileParam, } from "../../Controller/Profile/Profile.interface";
import { ProfileUpdateRequest,LibrarianUpdateUserProfileRequest } from "./ProfileRouter.types";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { LibrarianUpdateProfileRequestSchema, ProfileUpdateRequestSchema } from "../../Middleware/validation-handler/schema";
import { ClientErrorFactory } from "../../Errors/ErrorClass";
import { validate } from "../../Middleware/validation-handler";

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

         const profileUpdateConfig:Record<
            keyof UserUpdateProfileParam, 
            {
               getter: (p:Profile)=>string | null,
               setter: (p:Profile,value: string|null) => void
            } > = {
               "user_name":{
                  getter: (p)=>{return p.get_userName()},
                  setter: (p,value) => p.set_userName(value)
               },
               "first_name":{
                  getter: (p)=>{return p.get_firstName()},
                  setter: (p,value) => p.set_firstName(value)
               },
               "last_name":{
                  getter: (p)=>{return p.get_lastName()},
                  setter: (p,value) => p.set_lastName(value)
               },
               "contact":{
                  getter: (p)=>{return p.get_contact()},
                  setter: (p,value) => p.set_contact(value)
               },
               "address":{
                  getter: (p)=>{return p.get_address()},
                  setter: (p,value) => p.set_address(value)
               }
            }

        let hasChanges:boolean = false;

        for(const [field,config] of Object.entries(profileUpdateConfig)){
            if(field in req.body){
               const userInput = req.body[field as keyof typeof req.body]
               const currentVal = config.getter(userProfile)
               if(currentVal != userInput){
                  hasChanges = true;
                  config.setter(userProfile,userInput as string | null);
               }
            }
         }

        if(hasChanges){
            userProfile.set_updatedAt(new Date);
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
