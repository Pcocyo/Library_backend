import { RouterClass } from "./Ultils/RouterClass";
import { Request,Response } from "express";
import Profile from "../Controller/Profile/Profile";
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
   }

   private async getProfile(req:Request,res:Response){
      const user_id = req.body.authorizedUser.userId;
      const userProfile:Profile = await Profile.GetByUserId({user_id:user_id});
      res.send({
            user_id:user_id,
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
}
