import { RouterClass } from "./Ultils/RouterClass";
import { Request,Response } from "express";

export default class ProfileRouter extends RouterClass{
   public constructor(){
      super();
      this.initializeRoutes();
   }

   protected initializeRoutes(){
      this.router.get('/',(req:Request,res:Response)=>{
         res.send({message:"ProfileRouter"});
      })
   }
}
