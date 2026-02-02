import { UserRouter } from "./user.router";
import { UserService } from "./user.service";

export class UserModule{
   private userRouter: UserRouter;
   constructor(){
      this.userRouter = new UserRouter();
   }

   public getRouter(){
      return this.userRouter.getRouter()
   }
}
