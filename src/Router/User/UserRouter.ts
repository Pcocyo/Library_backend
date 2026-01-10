import { RouterClass } from "../Ultils/RouterClass";
import type { Request, Response,RequestHandler } from "express";
import User, {UserRole} from "../../Controller/User/User";
import { CreateUserRequest, DeleteUserRequest, GetUserRequest, LoginUserRequest, UpdateUserRequest} from "./UserRouter.types";
import {ErrorHandler_Middleware } from "../../Middleware/ErrorHandler_Middleware";
import Env from "../../Config/config";
import Profile from "../../Controller/Profile/Profile";
import { ClientError, ClientErrorFactory } from "../../Errors";

export class UserRouter extends RouterClass {
   public constructor() {
      super();
      this.initializeRoutes();
   }

   protected initializeRoutes() {
      this.router.post("/create",
         ErrorHandler_Middleware.ValidateEmailParameter,
         ErrorHandler_Middleware.ValidatePasswordParameter,
         (req: CreateUserRequest, res: Response) =>{
            this.createUser(req, res)
         }
      );

      this.router.get(
         "/getUser",
         this.validateToken,
         ErrorHandler_Middleware.ValidateEmailParameter,
         (req: GetUserRequest, res: Response) => {
            this.getUser(req, res);
         },
      );

      this.router.post("/login",
         ErrorHandler_Middleware.ValidateEmailParameter,
         ErrorHandler_Middleware.ValidatePasswordParameter,
         (req: LoginUserRequest, res: Response) => {
         this.login(req, res);
      });

      this.router.delete(
         "/delete",
         this.validateToken,
         (req: DeleteUserRequest, res: Response) => {
            this.deleteUser(req, res);
         },
      );

      this.router.put(
         "/update",
         this.validateToken,
         ErrorHandler_Middleware.ValidateEmailParameter,
         ErrorHandler_Middleware.ValidatePasswordParameter,
         ErrorHandler_Middleware.ValidateUserRoleParameter,
         (req: UpdateUserRequest, res: Response) => {
            this.updateUser(req, res);
         },
      );
   }


   private async updateUser(req: UpdateUserRequest, res: Response) {
      try {
         const { authorizedUser } = req.body;
         const userInstance = await User.getUserByEmail({
            email: authorizedUser.userEmail,
         });
         await userInstance.setEmail(req.body.email);
         await userInstance.setPassword(await Env.getGenerateBcrypt(req.body.password));
         await userInstance.setRole(req.body.userRole);
         let newToken = Env.getGenerateJwtToken(userInstance);
         res.send({ token: newToken });
      } catch (err: any) {
         res.status(400).send({
            error: err.message,
         });
      }
   }

   private async createUser(req: CreateUserRequest, res: Response) {
      try {
         let cryptedPass: string = await Env.getGenerateBcrypt(req.body.password);
         let user: User = await User.createNewUser({
            email: String(req.body.email),
            password: String(cryptedPass),
            role: null,
         });
         await Profile.CreateProfile({user_id:user.getId()});
         const token = Env.getGenerateJwtToken(user);
         res.json({
            token: token,
         });
      } catch (err: any) {
         res.status(400).json({
            error: err.message,
         });
      }
   }

   private async login(req: LoginUserRequest, res: Response) {
      try {
         const user = await User.getUserByEmail({ email: req.body.email });
         const correctPassword = await Env.getValidatePassword(
            req.body.password,
            user.getPassword(),
         );
         if (!correctPassword) {
            throw ClientErrorFactory.createIncorrectPasswordError({
               field:req.body.password,
               context:{user_request_info:req.body}
            });
         }
         const token = Env.getGenerateJwtToken(user);
         res.send({
            token: token,
         });
      } catch (error: any) {
         if(error instanceof ClientError){
            res.status(error.httpsStatusCode).send(error.toClientResponse());
         }
         else{
            res.status(400).send({ error: error.message });
         }
      }
   }

   private async getUser(req: GetUserRequest, res: Response) {
      try {
         const userFound: User = await User.getUserByEmail({ email: req.body.email });
         res.send({
            id: userFound.getId(),
            email: userFound.getEmail(),
            role: userFound.getUserRole(),
         });
      } catch (err: any) {
         res.status(400).send({
            error: err.message,
         });
      }
   }

   private async deleteUser(req: DeleteUserRequest, res: Response) {
      try {
         const { authorizedUser } = req.body;
         let userProfile:Profile = await Profile.GetByUserId({user_id:authorizedUser.userId});
         await Profile.DeleteProfile(userProfile);
         await User.deleteUser({
            id: authorizedUser.userId,
            email: authorizedUser.userEmail,
         });
         res.send({
            message: `User ${authorizedUser.userEmail} deleted`,
         });
      } catch (err: any) {
         res.status(400).send({
            error: err.message,
         });
      }
   }

   private validateEmail(emailToTest: string): Error | null {
      const emailRegx: RegExp =
         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegx.test(emailToTest)) {
         throw new Error("Invalid email");
      }
      return null;
   }

   private validatePassword(passwordToTest: string): Error | null {
      const passwordRegx: RegExp =
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;
      if (!passwordRegx.test(passwordToTest)) {
         throw new Error(
            "Invalid password, password must contain at least 1 special characther, capital letter, number, and in between 8-32 words",
         );
      }
      return null;
   }
}
