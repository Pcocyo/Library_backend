import { jest } from "@jest/globals";
import { Decimal } from "@prisma/client/runtime/library";
import { CreateUserDto } from "../../src/features/v1/user/dto";
import {mockDeep,DeepMockProxy} from 'jest-mock-extended'
import { PrismaClient } from "@prisma/client/extension";
import { getMockCalls, setMockRejectValue } from "../__helper__/mockHelper";
 
export interface UserDto{
   user_id:string,
   email: string,
   password: string,
   role: string,
   created_at: Date,
   updated_at: Date,
}


export function createDefaultUserDb(): UserDto{
    return {
        user_id: "123",
        email: "test@test.com",
        password: "hash123",
        role: "user",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
    };
}

export function createNewCustomUserDb(email:string, password:string):UserDto {
    return {
        user_id: "123",
        email: email,
        password: password,
        role: "user",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
    };
}

export function createDefaultProfileData(): any {
    return {
        user_name: "dummy_user_name",
        first_name: "dummy_first_name",
        last_name: "dummy_last_name",
        contact: "dummy_contact",
        address: "dummy_address",
        membership_date: new Date("2024-01-01"),
        status: "ACTIVE",
        total_fines: Decimal(0.0),
        updated_at: new Date("2024-01-01"),
    };
}

function userMockHelper(fn: jest.Mock<any>) {
    const __defaultResolvedValue: UserDto = createDefaultUserDb();
    let __customUser: UserDto | null = null;
    let __hasRejectValue: boolean = false;
    return {
        declareMockResolvedValue: (): void => {
            fn.mockResolvedValue(__defaultResolvedValue);
        },

        executeClearMock: (): void => {
            fn.mockResolvedValue(__defaultResolvedValue);
            __customUser = null;
            __hasRejectValue ? fn.mockReset() : fn.mockClear();
            __hasRejectValue = false;
        },

        getCalls: () => getMockCalls(fn),

        getDefaultResolvedValue: (): UserDto => __defaultResolvedValue,

        getCustomResolvedValue: (): UserDto | null => __customUser,

        getCurrentResolvedValue: (): UserDto => {
            const currentResolvedValue = __customUser ? __customUser : __defaultResolvedValue;
            return currentResolvedValue;
        },

        getMockfn: (): jest.Mock<any> => fn,

        setCustomResolvedvalue: (o: UserDto) => {
            __customUser = o;
            fn.mockResolvedValue(__customUser);
        },

        setDeleteCustomResolvedValue: (): void => {
            __customUser = null;
        },
        setMockResolveError:(errorMessage:string)=>{
            __hasRejectValue = true;
            fn.mockRejectedValue(new Error(errorMessage));
        }
    };
}

export function mk_prismaUserMethod(prisma:PrismaClient){
   return{
      update: userMockHelper(prisma.users.update),
      create: userMockHelper(prisma.users.create),
      delete: userMockHelper(prisma.users.delete),
      findUniqueOrThrow: userMockHelper(prisma.users.findUniqueOrThrow),
   }
};

export function mk_prismaProfileMethod(prisma:PrismaClient) {
   return{
      upsert: {
         declareMockResolvedValue: () =>
            (prisma.profiles.upsert as jest.Mock<any>).mockResolvedValue(createDefaultProfileData()),
         executeClearMock: () => (prisma.profiles.upsert as jest.Mock).mockClear(),
         getCalls: () => getMockCalls(prisma.profiles.upsert),
      },
      delete: {
         executeClearMock: () => (prisma.profiles.delete as jest.Mock).mockClear(),
         getCalls: () => getMockCalls(prisma.profiles.delete),
      },
   }
};
export const createMockPrisma = ():DeepMockProxy<PrismaClient> => {
   return mockDeep<PrismaClient>();
};
