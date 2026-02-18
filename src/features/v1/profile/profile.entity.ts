import {
    ProfileStatus,
    IProfileEntityConstructor,
    IProfileEntity,
} from "./types";

export class ProfileEntity implements IProfileEntity {
    private user_name: string | null;
    private first_name: string | null;
    private last_name: string | null;
    private contact: string | null;
    private address: string | null;
    private membership_date: Date | null;
    private status: ProfileStatus;
    private total_fines: number;
    private updated_at: Date | null;

    constructor(parameter: IProfileEntityConstructor) {
        this.user_name = parameter.user_name;
        this.first_name = parameter.first_name;
        this.last_name = parameter.last_name;
        this.contact = parameter.contact;
        this.address = parameter.address;
        this.membership_date = parameter.membership_date;
        this.status = parameter.status;
        this.total_fines = parameter.total_fines;
        this.updated_at = parameter.updated_at;
    }

    public get_user_name(): string | null {
        return this.user_name;
    }
    public get_first_name(): string | null {
        return this.first_name;
    }
    public get_last_name(): string | null {
        return this.last_name;
    }
    public get_contact(): string | null {
        return this.contact;
    }
    public get_address(): string | null {
        return this.address;
    }
    public get_membership_date(): Date | null {
        return this.membership_date;
    }
    public get_status(): ProfileStatus {
        return this.status;
    }
    public get_total_fines(): number {
        return this.total_fines;
    }
    public get_updated_at(): Date | null {
        return this.updated_at;
    }
}
