import { RouterClass } from "./Ultils/RouterClass";
import { NextFunction, Request,Response } from "express";
import Profile from "../Controller/Profile/Profile";
import User, { UserRole } from "../Controller/User/User";
import { ProfileStatus } from "../Controller/Profile/Profile.interface";
import { LibrarianUpdateProfileParam, UserUpdateProfileParam } from "../Controller/Profile/Profile.interface";
import { UserJwtPayloadInterface } from "../Config/config.interface";

export default class ProfileRouter extends RouterClass{
   public constructor(){
      super();
      this.initializeRoutes();
   }

   protected initializeRoutes(){
      this.router.get('/',(req:Request,res:Response)=>{
         res.send({message:"ProfileRouter"});
      })

      this.router.get("/getProfile",
         this.validateToken,
         (req:Request,res:Response)=>{
            this.getProfile(req,res);
         })

      this.router.patch("/update",
         this.validateToken,
         this.validateUserUpdate,
         (req:Request,res:Response)=>{
            this.updateUserProfile(req,res);
         })

      this.router.patch("/subscribe",
         this.validateToken,
         this.validateMemberStatus,
         (req:Request,res:Response)=>{
            this.subscribe(req,res);
         }
      )

      this.router.patch("/librarian/update",
         this.validateLibrarianToken,
         this.validateLibrarianProfileUpdate,
         (req:Request,res:Response) =>{
            this.updateLibrarianProfile(req,res);
         }
      )
   }

   private async getProfile(req:Request,res:Response){
      const userData:UserJwtPayloadInterface = req.body.authorizedUser;
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
   }
   
   private async updateUserProfile(req:Request,res:Response){
      const userData:UserJwtPayloadInterface = req.body.authorizedUser;
      const userParam:(keyof UserUpdateProfileParam)[] = ["user_name","first_name","last_name","contact","address"];
      const userInput:UserUpdateProfileParam = req.body.validatedInput as UserUpdateProfileParam;
      try{
         const userProfile:Profile = await Profile.GetByUserId({user_id:userData.userId});

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
            const input = userInput[param];
            updates[param as keyof typeof updates ](input as string | null);
         }

         //update profile.update_at data
         const updateDate = new Date;
         userProfile.set_updatedAt(updateDate);
         res.status(200).json({message:`Profile for user ${userData.userId} successfully updated on ${updateDate}`});
      }catch(err){
         res.send(400).json({error:err})
      }
   }

   private async updateLibrarianProfile(req:Request,res:Response){
      const input:LibrarianUpdateProfileParam = req.body.payload;
      const userToUpdate:User = await User.getUserByEmail({email:input.email})
      const userProfile:Profile = await Profile.GetByUserId({user_id:userToUpdate.getId()});
      try{
         userProfile.set_fines(input.total_fines as number);
         userProfile.set_status(ProfileStatus[input.status as keyof typeof ProfileStatus]);
         res.status(200).json({message:"success"});
      }catch(err: any){
         res.status(400).send({error:err.message})
      }
   }

   private async subscribe(req:Request,res:Response){
      try{
         const userData:UserJwtPayloadInterface = req.body.authorizedUser;
         const user:User = await User.getUserByEmail({email:userData.userEmail});
         const profile:Profile = await Profile.GetByUserId({user_id:userData.userId});
         user.setRole(UserRole.MEMBER);
         profile.set_memberDate(new Date);
         res.status(200).send({message:`User ${userData.userEmail} successfully subscribed`});
      }catch(err:any){
         res.status(400).send({
            message:err.message,
            error:err
         })
      }
   }

   private validateUserUpdate(req:Request,res:Response,next:NextFunction){
      const userParam:(keyof UserUpdateProfileParam)[] = ["user_name","first_name","last_name","contact","address"];
      const userInput:UserUpdateProfileParam = req.body.payload;

      const validators = {
         user_name:(user_name:string)=>{
            if(user_name.length < 3) throw new Error( "Username must be atleast 3 characther long") 
            if(!/^[a-zA-Z-1-9_]+$/.test(user_name)) throw new Error( "Username can only contain letters, numbers, and underscores");
         },
         first_name:(first_name:string)=>{
            if(first_name.length < 3) throw new Error("Name must be atleast 3 characther long");
         },
         last_name:(last_name:string)=>{
            if(last_name.length < 3) throw new Error("Name must be atleast 3 characther long");
         },
         contact:(contact:string)=>{
            if(contact.length < 7 || contact.length > 15) throw new Error("Contact number must be between 7 and 15 digits");
            if(!/^[0-9]+$/.test(contact)) throw new Error("Contact number can only contain digits");
         },
         address:(address:string)=>{
            if(address.length < 3) throw new Error("Address is invalid");
         },
      }

      try {
         for(const param of userParam){
            const value = userInput[param];
            if(userInput[param] === undefined) throw new Error(`Missing ${param} attributes`); 
            if(userInput[param] === null) continue;
            if(validators[param as keyof typeof validators]){
               validators[param as keyof typeof validators](value as string)
            }
         }
         req.body.validatedInput = userInput;
         next();
      } catch (error:any) {
         res.status(400).json({error:error.message});
      }
   }

   private validateLibrarianProfileUpdate(req:Request,res:Response,next:NextFunction){
      const userInput = req.body.payload;
      const librarianParam:(keyof LibrarianUpdateProfileParam)[] = ["status","total_fines","email"];
      const validators = {
         "total_fines":(input:string)=>{
            if(!/^\d{1,10}\.\d+$/.test(`${input}`)){
               throw new Error("Invalid total_fines format");
            }
         },
         "status":(input:string)=>{
            if(!(input in ProfileStatus)){
               throw new Error("Invalid status input");
            }
         },
         "email":(input:string)=>{
            const emailRegx: RegExp =
               /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegx.test(input)) {
               throw new Error("Invalid email input");
            }
         }
      }

     try {
        for(let param of librarianParam){
            if(userInput[param] === undefined) throw new Error(`${param} is undefined`);
            if(param === "email" && userInput[param] === null) throw new Error(`email is null`);
            if(userInput[param] === null) continue;
            validators[param as keyof typeof validators](userInput[param] as string);
         }
         next()
     } catch (error:any) {
         res.status(400).send({error: error.message});
     }
   }

   private validateMemberStatus(req:Request,res:Response,next:NextFunction){
      try{
         let userData:UserJwtPayloadInterface = req.body.authorizedUser
         if(userData.userRole !== "GUEST") throw new Error(`User is already a ${userData.userRole}`);
         next()
      }
      catch(err:any){
         res.status(400).send({error:err.message});
      }
   }
}
