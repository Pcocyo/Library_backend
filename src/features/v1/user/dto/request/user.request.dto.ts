import {
    CreateUserRequestSchema,
    GetUserRequestSchema,
    LoginUserRequestSchema,
} from "../../user.schema";
import { Request } from "express";
import { z } from "zod";
import { AccessTokenPayload } from "../../../../../core/security/interfaces";
export type CreateUserRequestDto = z.infer<typeof CreateUserRequestSchema>;
export type GetUserRequestDto = z.infer<typeof GetUserRequestSchema>;
export type LoginUserRequestDto = z.infer<typeof LoginUserRequestSchema>;

export class UpdateUserRequestDto {
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
        return new UpdateUserRequestDto(req.body.authorizedUser, {
            email: req.body.email,
            password: req.body.password,
        });
    }
}
