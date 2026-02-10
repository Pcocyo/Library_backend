import { UserRouter } from "./v1/user/";
import { IAuthMiddleware } from "../core/middleware/types";
import { IJwtService } from "../core/security/interfaces";

export default class UserModule{
   private userRouter: UserRouter;
   private authMiddleware: IAuthMiddleware; 
   private jwtService: IJwtService;
   constructor(authMiddleware: IAuthMiddleware, jwtService: IJwtService){
      this.jwtService = jwtService;
      this.authMiddleware = authMiddleware;
      this.userRouter = new UserRouter({authMiddleware:authMiddleware,jwtService:jwtService});
   }

   public getRouter(){
      return this.userRouter.getRouter();
   }
}
