import { Request } from "express"
import { UserJwtPayloadInterface } from "../../Config/config.interface"

export interface ProfileUpdateRequest extends Request {
   body: {
      user_name: string | null,
      first_name: string | null,
      last_name:string | null,
      contact:string | null,
      address:string | null,
      authorizedUser:UserJwtPayloadInterface
   }
};

export interface ProfileSubscribeRequest extends Request {
   body:{
      authorizedUser:UserJwtPayloadInterface
   }
};

