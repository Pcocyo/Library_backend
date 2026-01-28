//table.check("status in ('ACTIVE','SUSPENDED','BANNED')");
//table.uuid("user_id").references("user_id").inTable("users");
//table.string("user_name", 20); //represent user custom username
//table.string("first_name", 20); // represent user first name
//table.string("last_name", 20); // represent user last name
//table.string("contact", 17); // represent user contact number
//table.text("address"); // represnt user home address
//table.timestamp("membership_date"); // represent user membership date (if null, not a member)
//table.string("status",10).notNullable().defaultTo("ACTIVE"); // represent user status, (active, suspended, banned)
//table.decimal("total_fines",10,2).notNullable().defaultTo(0.00); // user total fines in usd
//table.timestamp("updated_at"); // represent user data last profile updates
//

import { ClientError, ClientErrorFactory } from "../../Errors";
import prisma from "../../prismaClient";
import {
    ProfileParam,
    ProfileStatus,
    CreateProfileParam,
    GetByUserIdParam,
} from "./Profile.interface";
import { ErrorMapperGroup } from "../../Errors/ErrorMapper";

export default class Profile {
    private user_id: string;
    private user_name: string | null;
    private first_name: string | null;
    private last_name: string | null;
    private contact: string | null;
    private address: string | null;
    private membership_date: Date | null;
    private status: ProfileStatus;
    private total_fines: number;
    private updated_at: Date | null;

    private constructor(params: ProfileParam) {
        this.user_id = params.user_id;
        this.user_name = params.user_name;
        this.first_name = params.first_name;
        this.last_name = params.last_name;
        this.contact = params.contact;
        this.address = params.address;
        this.membership_date = params.membership_date;
        this.status = params.status;
        this.total_fines = params.total_fines;
        this.updated_at = params.updated_at;
    }

    public get_userId(): string {
        return this.user_id;
    }

    public get_userName(): string | null {
        return this.user_name;
    }

    public get_firstName(): string | null {
        return this.first_name;
    }

    public get_lastName(): string | null {
        return this.last_name;
    }

    public get_contact(): string | null {
        return this.contact;
    }

    public get_address(): string | null {
        return this.address;
    }

    public get_memberDate(): Date | null {
        return this.membership_date;
    }

    public get_status(): ProfileStatus {
        return this.status;
    }

    public get_totalFines(): number {
        return this.total_fines;
    }

    public get_updatedAt(): Date | null {
        return this.updated_at;
    }

    public async set_userName(new_userName: string | null) {
        if (new_userName) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { user_name: new_userName },
                });
                this.user_name = new_userName;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_firstName(new_firstName: string | null) {
        if (new_firstName) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { first_name: new_firstName },
                });
                this.first_name = new_firstName;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_lastName(new_lastName: string | null) {
        if (new_lastName) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { last_name: new_lastName },
                });
                this.last_name = new_lastName;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_contact(new_contact: string | null) {
        if (new_contact) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { contact: new_contact },
                });
                this.contact = new_contact;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_address(new_address: string | null) {
        if (new_address) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { address: new_address },
                });
                this.address = new_address;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_memberDate(new_memberDate: Date | null) {
        if (new_memberDate) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { membership_date: new_memberDate.toISOString() },
                });
                this.membership_date = new_memberDate;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_status(new_status: ProfileStatus | null) {
        if (new_status) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { status: new_status.toString() },
                });
                this.status = new_status;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_fines(new_fines: number | null) {
        if (new_fines) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { total_fines: parseFloat(new_fines.toFixed(2)) },
                });
                this.total_fines = parseFloat(new_fines.toFixed(2));
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public async set_updatedAt(new_updatedAt: Date | null) {
        if (new_updatedAt) {
            try {
                await prisma.profiles.update({
                    where: { user_id: this.user_id },
                    data: { updated_at: new_updatedAt.toISOString() },
                });
                this.updated_at = new_updatedAt;
            } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
            }
        }
    }

    public static async CreateProfile(
        params: CreateProfileParam,
    ): Promise<Profile> {
        let profile;
        try {
            profile = await prisma.profiles.create({
                data: {
                    user_id: params.user_id,
                    user_name: params.user_name,
                    first_name: params.first_name,
                    last_name: params.last_name,
                    contact: params.contact,
                    address: params.address,
                    membership_date: params.membership_date,
                    updated_at: params.updated_at,
                },
            });
        } catch (error) {
               throw ErrorMapperGroup.getInstance().mapError(error);
        }
        const newProfileParam: ProfileParam = {
            user_id: profile.user_id,
            user_name: profile.user_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            contact: profile.contact,
            address: profile.address,
            membership_date: profile.membership_date,
            status: ProfileStatus[profile.status as keyof typeof ProfileStatus],
            total_fines: profile.total_fines.toNumber(),
            updated_at: profile.updated_at,
        };
        return new Profile(newProfileParam);
    }

   public static async DeleteProfile(profile: Profile) {
      try {
         await prisma.profiles.delete({
            where: { user_id: profile.get_userId() },
         });
      } catch (error) {
         throw ErrorMapperGroup.getInstance().mapError(error);
      }
   }

   public static async GetByUserId(param: GetByUserIdParam): Promise<Profile> {
      try{
         let profile = await prisma.profiles.findUnique({
            where: { user_id: param.user_id },
         });
         if (!profile) {
            throw ClientErrorFactory.createUserIdNotFoundError({context:{data_recieved:param}})
         }
         let newProfileParam: ProfileParam = {
            user_id: profile.user_id,
            user_name: profile.user_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            contact: profile.contact,
            address: profile.address,
            membership_date: profile.membership_date,
            status: ProfileStatus[profile.status as keyof typeof ProfileStatus],
            total_fines: profile.total_fines.toNumber(),
            updated_at: profile.updated_at,
         };
         return new Profile(newProfileParam);
      }catch(error){
         if(error instanceof ClientError){
            throw error 
         }
         throw ErrorMapperGroup.getInstance().mapError(error);
      }
   }

    static Tests__CreateProfile__(params: ProfileParam): Profile {
        return new Profile(params);
    }
}
