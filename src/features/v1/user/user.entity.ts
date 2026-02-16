import { UserRole, IUserEntityConstructor, IUserEntity} from "./types";

export class UserEntity implements IUserEntity{
    private userId: string;
    private email: string;
    private password: string;
    private role: UserRole;
    private created_at: Date;
    private updated_at: Date;

    public constructor(data:IUserEntityConstructor) {
        this.userId = data.user_id;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role as UserRole;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    public getEmail(): string {
        return this.email;
    }

    public getId(): string {
        return this.userId;
    }

    public getPassword(): string {
        return this.password;
    }

    public getRole(): UserRole {
        return this.role;
    }

    public getCreatedAt(): Date {
        return this.created_at;
    }

    public getUpdatedAt(): Date {
        return this.updated_at;
    }
}
