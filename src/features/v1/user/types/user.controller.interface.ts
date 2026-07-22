import { Response, NextFunction, Request } from "express";

export interface IUserController{
  updateUser(req:Request,res:Response,next:NextFunction): Promise<void>;
  createUser(req:Request,res:Response,next:NextFunction): Promise<void>;
  login(req:Request,res:Response,next:NextFunction): Promise<void>;
  getUser(req:Request,res:Response,next:NextFunction): Promise<void>;
  deleteUser(req:Request,res:Response,next:NextFunction): Promise<void>;
  activate_membership(req:Request,res:Response,next:NextFunction): Promise<void>;
  assign_librarian(req:Request,res:Response,next:NextFunction): Promise<void>;
}
