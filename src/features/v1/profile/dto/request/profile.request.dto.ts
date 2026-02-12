import z from "zod";
import { Request } from "express";
import { AccessTokenPayload } from "../../../../../core/security/interfaces";
import { ProfileUpdateRequestSchema, LibrarianUpdateProfileRequestSchema } from "../../profile.schema";

export class ProfileUpdateDto {
    public readonly data: z.infer<typeof ProfileUpdateRequestSchema>;
    public readonly token: AccessTokenPayload;

    private constructor(
        data: z.infer<typeof ProfileUpdateRequestSchema>,
        token: AccessTokenPayload,
    ) {
        this.data = data;
        this.token = token;
    }
    static fromRequest(req: Request):ProfileUpdateDto {
        let data = {
         user_name: req.body.user_name,
         first_name:req.body.first_name,
         last_name:req.body.last_name,
         contact:req.body.contact,
         address:req.body.address
      }
      return new ProfileUpdateDto(data,req.body.authorizedUser);
    }
}

export class LibrarianUpdateProfileDto {
   public readonly data: z.infer<typeof LibrarianUpdateProfileRequestSchema>;
   public readonly token: AccessTokenPayload;
   private constructor(token: AccessTokenPayload,data: z.infer<typeof LibrarianUpdateProfileRequestSchema>){
      this.data = data;
      this.token = token;

   }
   static fromRequest(req:Request): LibrarianUpdateProfileDto{
     const data = {
         total_fines:req.body.total_fines,
         status: req.body.status,
         email: req.body.email
      }
     return new LibrarianUpdateProfileDto(req.body.authorizedUser,data);
   }

}

export class GetProfileDto {
   public readonly token: AccessTokenPayload;
   private constructor(token: AccessTokenPayload){
      this.token = token;
   }
   static fromRequest(req:Request): GetProfileDto {
      return new GetProfileDto(req.body.authorizedUser);
   }
}

export class SubscribeDto{
   public readonly token: AccessTokenPayload;
   private constructor(token: AccessTokenPayload){
      this.token = token;
   }
   static fromRequest(req:Request): SubscribeDto {
      return new SubscribeDto(req.body.authorizedUser);
   }
}


