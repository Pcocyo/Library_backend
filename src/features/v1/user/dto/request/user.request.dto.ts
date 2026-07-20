import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
} from "../../user.schema";
import { Request } from "express";
import { z } from "zod";
import { AccessTokenPayload } from "../../../../../core/security/interfaces";
import { UserRole } from "../../types";
export type CreateUserDto = z.infer<typeof CreateUserRequestSchema>;
export type LoginUserDto = z.infer<typeof LoginUserRequestSchema>;

export class GetUserDto{
   public readonly data:z.infer<typeof GetUserRequestSchema>;
   public readonly token: AccessTokenPayload;
   private constructor(data:z.infer<typeof GetUserRequestSchema>,token: AccessTokenPayload){
     this.data = data;
     this.token = token;
   }
   static fromRequest(req:Request):GetUserDto{
      return new GetUserDto({email:req.body.email},req.body.authorizedUser);
   }
} 

export class DeleteUserDto{
   public readonly token: AccessTokenPayload;
   private constructor(token: AccessTokenPayload){
     this.token = token;
   }
   static fromRequest(req:Request):DeleteUserDto{
      return new DeleteUserDto(req.body.authorizedUser);
   }
}

export class UpdateUserDto {
    public readonly token: AccessTokenPayload;
    public readonly data: { email: string | null; password: string | null };
    private constructor(
        token: AccessTokenPayload,
        data: { email: string | null; password: string | null },
    ) {
        this.token = token;
        this.data = data;
    }
    public static fromRequest(req: Request) {
        return new UpdateUserDto(req.body.authorizedUser, {
            email: req.body.email,
            password: req.body.password,
        });
    }
}

export class ActivateMembershipDto{
   public readonly data: { id:string, role: UserRole};
   private constructor(id:string,role:UserRole){
      this.data = {id:id,role:role};
   }
   public static fromRequest(req:Request){
      return new ActivateMembershipDto(req.body.authorizedUser.id,req.body.authorizedUser.role as UserRole);
   } 
}
