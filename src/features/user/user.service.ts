import { ClientErrorFactory } from "../../../src/core/error/exceptions";
import prisma from "../../prismaClient";
import { ErrorMapperGroup } from "../../core/error/mappers";
import { 
    UserRegisterInterface,
    UserGetEmailInterface,
    UserDomainInterface,
    UserDeleteInterface,
} from "./types/user-service.types";
import { UserRole } from "./types/user-service.types";
//user_id    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
//email      String   @unique(map: "users_email_unique") @db.VarChar(255)
//password   String   @db.VarChar(255)
//role       String   @default("GUEST") @db.VarChar(255)
//created_at DateTime @default(dbgenerated("CURRENT_TIMESTAMP(6)")) @db.Timestamptz(6)

export class UserService {
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
    public async setEmail(newEmail: string | null) {
        if (newEmail) {
            try {
                await prisma.users.update({
                    where: { user_id: this.userId },
                    data: { email: newEmail },
                });
            } catch (error) {
                throw ErrorMapperGroup.getInstance().mapError(error);
            }
            this.email = newEmail;
        }
        return;
    }

    public async setPassword(newPassword: string | null) {
        if (newPassword) {
            try {
                await prisma.users.update({
                    where: { user_id: this.userId },
                    data: { password: newPassword },
                });
            } catch (error) {
                throw ErrorMapperGroup.getInstance().mapError(error);
            }
            this.password = newPassword;
        }
        return;
    }

    public async setRole(newRole: UserRole | null) {
        if (newRole != null) {
            try {
                await prisma.users.update({
                    where: { user_id: this.userId },
                    data: { role: String(newRole) },
                });
            } catch (error) {
                throw ErrorMapperGroup.getInstance().mapError(error);
            }
            this.role = newRole;
        }
        return;
    }

    public static async createNewUser(
        userRegisterData: UserRegisterInterface,
    ): Promise<UserService> {
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
            return new UserService({
                id: newDbUser.user_id,
                email: newDbUser.email,
                password: newDbUser.password,
                role: userRegisterData.role,
                created_at: new Date(newDbUser.created_at),
            });
        } catch (error) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    public static async getUserByEmail(
        userLoginData: UserGetEmailInterface,
    ): Promise<UserService> {
        try {
            const userDbFound = await prisma.users.findUnique({
                where: {
                    email: userLoginData.email,
                },
            });

            if (userDbFound == null) {
                throw ClientErrorFactory.createEmailNotFoundError({
                    context: { data_recieved: userLoginData },
                });
            }
            return new UserService({
                id: userDbFound.user_id,
                email: userDbFound.email,
                password: userDbFound.password,
                role: UserRole[userDbFound.role as keyof typeof UserRole],
                created_at: new Date(userDbFound.created_at),
            });
        } catch (error) {
            error = ErrorMapperGroup.getInstance().mapError(error);
            throw error;
        }
    }

    public static async deleteUser(userData: UserDeleteInterface) {
        try {
            await prisma.users.delete({
                where: {
                    user_id: userData.id,
                    email: userData.email,
                },
            });
        } catch (error) {
            throw ErrorMapperGroup.getInstance().mapError(error);
        }
    }

    // Test only
    static tests__createTestUser(
        dummyId: string,
        dummyEmail: string,
        password: string,
        role: UserRole,
        created_at: Date,
    ): UserService {
        return new UserService({
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
    ): Promise<UserService> {
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
            return new UserService({
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
