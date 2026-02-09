import { UserRouter } from "./user.router";
import { IAuthMiddleware } from "../../../core/middleware/types";

export default class UserModule{
   private userRouter: UserRouter;
   private authMiddleware: IAuthMiddleware; 

   constructor(authMiddleware: IAuthMiddleware){
      this.authMiddleware = authMiddleware;
      this.userRouter = new UserRouter(this.authMiddleware);
   }

   public getRouter(){
      return this.userRouter.getRouter();
   }
}
