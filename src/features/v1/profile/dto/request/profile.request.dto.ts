import z from "zod";
import { Request } from "express";
import { AccessTokenPayload } from "../../../../../core/security/interfaces";
import { ProfileUpdateRequestSchema } from "../../profile.schema";
import { Prisma } from "@prisma/client";

export class ProfileUpdateDto {
    public readonly data: z.infer<typeof ProfileUpdateRequestSchema>;
    public readonly token: AccessTokenPayload;

    private constructor(data: z.infer<typeof ProfileUpdateRequestSchema>, token: AccessTokenPayload) {
        this.data = data;
        this.token = token;
    }
    static fromRequest(req: Request): ProfileUpdateDto {
        let data = {
            user_name: req.body.user_name ?? undefined,
            first_name: req.body.first_name ?? undefined,
            last_name: req.body.last_name ?? undefined,
            contact: req.body.contact ?? undefined,
            address: req.body.address ?? undefined,
        };
        return new ProfileUpdateDto(data, req.body.authorizedUser);
    }
}

export class LibrarianUpdateProfileDto {
    public readonly data: {
        total_fines: Prisma.Decimal | undefined;
        status: "ACTIVE" | "SUSPENDED" | "BANNED" | undefined;
        email: string;
    };
    public readonly token: AccessTokenPayload;
    private constructor(
        token: AccessTokenPayload,
        data: {
            total_fines: Prisma.Decimal | undefined;
            status: "ACTIVE" | "SUSPENDED" | "BANNED" | undefined;
            email: string;
        },
    ) {
        this.data = data;
        this.token = token;
    }
    static fromRequest(req: Request): LibrarianUpdateProfileDto {
        const data = {
            total_fines: req.body.total_fines == null ?  undefined : new Prisma.Decimal(req.body.total_fines),
            status: req.body.status,
            email: req.body.email,
        };
        return new LibrarianUpdateProfileDto(req.body.authorizedUser, data);
    }
}

export class GetProfileDto {
    public readonly token: AccessTokenPayload;
    private constructor(token: AccessTokenPayload) {
        this.token = token;
    }
    static fromRequest(req: Request): GetProfileDto {
        return new GetProfileDto(req.body.authorizedUser);
    }
}

export class SubscribeDto {
    public readonly token: AccessTokenPayload;
    private constructor(token: AccessTokenPayload) {
        this.token = token;
    }
    static fromRequest(req: Request): SubscribeDto {
        return new SubscribeDto(req.body.authorizedUser);
    }
}
