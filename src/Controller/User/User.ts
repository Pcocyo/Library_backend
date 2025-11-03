import { throws } from "assert";
import prisma from "../../prismaClient.ts";
import type {
    UserRegisterInterface,
    UserGetEmailInterface,
    UserDomainInterface,
    UserDeleteInterface,
} from "./User.interface.ts";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export enum UserRole {
    MEMBER = "MEMBER",
    LIBRARIAN = "LIBRARIAN",
    GUEST = "GUEST",
}

//user_id    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
//email      String   @unique(map: "users_email_unique") @db.VarChar(255)
//password   String   @db.VarChar(255)
//role       String   @default("GUEST") @db.VarChar(255)
//created_at DateTime @default(dbgenerated("CURRENT_TIMESTAMP(6)")) @db.Timestamptz(6)

export default class User {
    private userId: string;
    private email: string;
    private password: string;
    private role: UserRole;
    private created_at: Date;

    private constructor(userDomainInterface: UserDomainInterface) {
        this.userId = userDomainInterface.id;
        this.email = userDomainInterface.email;
        this.password = userDomainInterface.password;
        this.role = userDomainInterface.role as unknown as UserRole;
        this.created_at = userDomainInterface.created_at;
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

    public getUserRole(): UserRole {
        return this.role;
    }

    public getCreatedAt(): Date {
        return this.created_at;
    }

    // set basic user data
    public async setEmail(newEmail: string) {
        try{
            await prisma.users.update({
               where:{user_id:this.userId},
               data:{email:newEmail},
            })
        }catch(error){
           throw error; 
        }

        this.email = newEmail;
    }

    public async setPassword(newPassword:string) {
        try{
            await prisma.users.update({
               where:{user_id:this.userId},
               data:{password:newPassword},
            })
        }catch(error){
           throw error; 
        }
        this.password = newPassword;
    }

    public async setRole(newRole: UserRole) {
        try {
           await prisma.users.update({
                where:{user_id:this.userId},
                data:{role:String(newRole)}
            }) 
        } catch (error) {
           throw(error);
        }
        this.role = newRole;
    }

    public static async createNewUser(
        userRegisterData: UserRegisterInterface,
    ): Promise<User> {
        userRegisterData.role =
            userRegisterData.role == null
                ? UserRole.GUEST
                : userRegisterData.role;
        try {
            const newDbUser = await prisma.users.create({
                data: {
                    email: userRegisterData.email,
                    password: userRegisterData.password,
                    role: String(userRegisterData.role),
                },
            });
            return new User({
                id: newDbUser.user_id,
                email: newDbUser.email,
                password: newDbUser.password,
                role: userRegisterData.role,
                created_at: new Date(newDbUser.created_at),
            });
        } catch (PrismaClientKnownRequestError) {
            throw PrismaClientKnownRequestError;
        }
    }

    public static async getUserByEmail(
        userLoginData: UserGetEmailInterface,
    ): Promise<User> {
        try {
            const userDbFound = await prisma.users.findUnique({
                where: {
                    email: userLoginData.email,
                },
            });

            if (userDbFound == null) {
                throw new Error(
                    `User Email ${userLoginData.email} not exist in database`,
                );
            }
            return new User({
                id: userDbFound.user_id,
                email: userDbFound.email,
                password: userDbFound.password,
                role: UserRole[userDbFound.role as keyof typeof UserRole],
                created_at: new Date(userDbFound.created_at),
            });
        } catch (error) {
            throw error;
        }
    }

    public static async deleteUser(userData:UserDeleteInterface){
        try{
            await prisma.users.delete({
                where:{
                    user_id:userData.id,
                    email:userData.email 
                }
            })   
        }catch(error){
            throw error;
        }
    }



    // Test only
    static tests__createTestUser(
        dummyId: string,
        dummyEmail: string,
        password: string,
        role: UserRole,
        created_at: Date
    ): User {
        return new User({
            id: dummyId,
            email: dummyEmail,
            password: password,
            role: role,
            created_at: created_at,
        });
    }

    // Test only
    static async tests__createDbTestUser(
        dummyUserData: UserRegisterInterface,
    ): Promise<User> {
        try {
            dummyUserData.role =
                dummyUserData.role == null
                    ? UserRole.GUEST
                    : dummyUserData.role;

            let testUser = await prisma.users.create({
                data: {
                    email: dummyUserData.email,
                    password: dummyUserData.password,
                    role: String(dummyUserData.role),
                },
            });
            return new User({
                id: testUser.user_id,
                email: testUser.email,
                password: testUser.password,
                role: UserRole[testUser.role as keyof typeof UserRole],
                created_at: new Date(testUser.created_at),
            });
        } catch (error) {
            throw error;
        }
    }
}
