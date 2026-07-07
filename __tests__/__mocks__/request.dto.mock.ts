import {
    GetUserDto,
    DeleteUserDto,
    UpdateUserDto,
} from "../../src/features/v1/user/dto";

import {
    GetProfileDto,
    LibrarianUpdateProfileDto,
    ProfileUpdateDto,
} from "../../src/features/v1/profile/dto";

import { Request } from "express";

type createGetByUserDtoParameter = {
    email: string;
    authorizedUser: {
        email: string;
        id: string;
        role: string;
    };
};
export function createGetByUserDto(
    parameter: createGetByUserDtoParameter,
): GetUserDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        email: parameter.email,
        authorizedUser: parameter.authorizedUser,
    };
    return GetUserDto.fromRequest(request as Request);
}

type createDeleteUserDtoParameter = {
    email: string;
    id: string;
    role: string;
};

export function createDeleteUserDto(
    parameter: createDeleteUserDtoParameter,
): DeleteUserDto {
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
            email: null,
            password:null,
            authorizedUser: {
                email: "dummyEmail",
                role: "dummyRole",
                id: "dummyId",
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

export function createGetProfileDto(param: {
    email: string;
    role: string;
    id: string;
}): GetProfileDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        authorizedUser: {
            email: param.email,
            role: param.role,
            id: param.id,
        },
    };
    return GetProfileDto.fromRequest(request as Request);
}

export function createProfileUpdateDto(
    param: {
        user_name: string | null;
        first_name: string | null;
        last_name: string | null;
        contact: string | null;
        address: string | null;
    },
    auth: {
        email: string;
        id: string;
        role: string;
    },
): ProfileUpdateDto {
    let request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        user_name: param.user_name,
        first_name: param.first_name,
        last_name: param.last_name,
        contact: param.contact,
        address: param.address,
        authorizedUser: {
            email: auth.email,
            role: auth.role,
            id: auth.id,
        },
    };
    return ProfileUpdateDto.fromRequest(request as Request);
}

export function createLibrarianProfileDto(
    param: {
        total_fines: number | null;
        status: string | null;
        email: string;
    },
    auth: {
        email: string;
        id: string;
        role: string;
    },
): LibrarianUpdateProfileDto {

    const request: Partial<Request> = { headers: {}, body: {} };
    request.body = {
        total_fines: param.total_fines,
        status: param.status,
        email: param.email,
        authorizedUser: {
            email: auth.email,
            role: auth.role,
            id: auth.id,
        },
    };
    return LibrarianUpdateProfileDto.fromRequest(request as Request);
}
