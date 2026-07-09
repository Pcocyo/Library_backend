import { IUserEntity } from "../../types";

export class GetUserResponseDto {
    readonly user: {
        user_id: string;
        email: string;
    };
    private constructor(user: IUserEntity) {
        this.user = { user_id: user.getId(), email: user.getEmail() };
    }
    public static extract(user: IUserEntity): GetUserResponseDto {
        return new GetUserResponseDto(user);
    }

    public toResponse(): {
        user_id: string;
        email: string;
    } {
        return this.user;
    }
}
