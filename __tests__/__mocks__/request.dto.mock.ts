import {
    GetUserDto,
    DeleteUserDto,
    UpdateUserDto,
} from "../../src/features/v1/user/dto";
import { Request } from "express";

type createGetByUserDtoParameter = {
   email:string,
   authorizedUser:{
      email:string,
      id:string,
      role:string
   }
}
export function createGetByUserDto(parameter:createGetByUserDtoParameter): GetUserDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        email:parameter.email,
        authorizedUser:parameter.authorizedUser,
    };
    return GetUserDto.fromRequest(request as Request);
}

type createDeleteUserDtoParameter = {
   email:string,
   id: string,
   role: string
}

export function createDeleteUserDto(parameter:createDeleteUserDtoParameter): DeleteUserDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        authorizedUser: {
            email: parameter.email,
            role: parameter.role,
            id: parameter.id,
        },
    };
    return DeleteUserDto.fromRequest(request as Request);
}

export function createUpdateUserDto(haveNull: boolean): UpdateUserDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    if (haveNull) {
        request.body = {
            authorizedUser: {
                email: null,
                password: "newPassword",
                authorizedUser: {
                    email: "dummyEmail",
                    role: "dummyRole",
                    id: "dummyId",
                },
            },
        };
    } else {
        request.body = {
            email: "newEmail",
            password: "newPassword",
            authorizedUser: {
                email: "dummyEmail",
                role: "dummyRole",
                id: "dummyId",
            },
        };
    }
    return UpdateUserDto.fromRequest(request as Request);
}
