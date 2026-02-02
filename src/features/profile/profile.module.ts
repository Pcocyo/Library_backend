import { ProfileRouter } from "./profile.router";
import { ProfileService } from "./profile.service";

export class ProfileModule{
   private profileRouter: ProfileRouter;
   constructor(){
      this.profileRouter = new ProfileRouter();
   }

   public getRouter(){
      return this.profileRouter.getRouter();
   }
}
