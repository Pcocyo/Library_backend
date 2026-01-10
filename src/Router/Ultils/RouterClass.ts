import { Router,Response,Request,NextFunction } from "express";
import Env from "../../Config/config";
import { UserJwtPayloadInterface } from "../../Config/config.interface";
import { UserRole } from "../../Controller/User/User";
import { BaseError, ClientError, ClientErrorFactory } from "../../Errors";
export abstract class RouterClass {
    protected router: Router;

    public constructor() {
        this.router = Router();
    }

    public getRouter(): Router {
        return this.router;
   }

  protected validateToken(req: Request, res: Response, next: NextFunction) {
      try {
         const token = req.headers.authorization;
         if (!token) throw ClientErrorFactory.createUnauthorizedRequestError({context:{user_request_info:req.body}});
         if (!req.body) req.body = {authorizedUser: Env.getValidateToken(token)};
         req.body.authorizedUser = Env.getValidateToken(token);
         next();
      } catch (error: any) {
         if(error instanceof ClientError) res.status(error.httpsStatusCode).send(error.toClientResponse());
         res.send({error});
      }
   }

   protected validateLibrarianToken(req: Request, res: Response, next: NextFunction) {
      function isLibrarian(payloadToken:UserJwtPayloadInterface):boolean{
         if(payloadToken.userRole === UserRole.LIBRARIAN) return true;
         return false;
      }
      try {
         const token = req.headers.authorization;
         if (!token) throw new Error("Unauthorized Request");
         const parsedToken = Env.getValidateToken(token);
         if (!isLibrarian(parsedToken)) throw new Error("Unauthorized Request")
         if (!req.body) req.body = {authorizedAdmin: parsedToken};
         req.body.authorizedAdmin = parsedToken;
         next();
      } catch (err: any) {
         res.status(400).send({ error: err.message });
      }
   }
   protected abstract initializeRoutes(): void;
}
