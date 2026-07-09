import { jest } from "@jest/globals";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client/extension";
import { getMockCalls } from "../__helper__/mockHelper";
import { ProfileStatus } from "../../src/features/v1/profile/types";
import { Prisma } from "@prisma/client";

interface UserDto {
    user_id: string;
    email: string;
    password: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

interface ProfileDto {
    user_id: string;
    user_name: string | null;
    first_name: string | null;
    last_name: string | null;
    contact: string | null;
    address: string | null;
    membership_date: Date | null;
    status: ProfileStatus;
    total_fines: any;
    updated_at: Date | null;
}

export function createDefaultUserDb(): UserDto {
    return {
        user_id: "123",
        email: "test@test.com",
        password: "hash123",
        role: "GUEST",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
    };
}

export function createDefaultProfileDb(): ProfileDto {
    return {
        user_id: "test_user_id",
        user_name: "test_user_name",
        first_name: "test_first_name",
        last_name: "test_last_name",
        contact: "test_contact",
        address: "test_address",
        membership_date: null,
        status: "ACTIVE",
        total_fines: Prisma.Decimal(10),
        updated_at: new Date(),
    };
}

export function createNewCustomUserDb(email: string, password: string): UserDto {
    return {
        user_id: "123",
        email: email,
        password: password,
        role: "user",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
    };
}

export function createCustomProfileDb(id: string): ProfileDto {
    return {
        user_id: id,
        user_name: "test_user_name",
        first_name: "test_first_name",
        last_name: "test_last_name",
        contact: "test_contact",
        address: "test_address",
        membership_date: null,
        status: "ACTIVE",
        total_fines: Prisma.Decimal(10),
        updated_at: new Date(),
    };
}

function mockHelper<T>(fn: jest.Mock<any>, defaultFn: () => T) {
    const __defaultResolvedValue: T = defaultFn();
    let __customUser: T | null = null;
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

        getDefaultResolvedValue: (): T => __defaultResolvedValue,

        getCustomResolvedValue: (): T | null => __customUser,

        getCurrentResolvedValue: (): T => {
            const currentResolvedValue = __customUser ? __customUser : __defaultResolvedValue;
            return currentResolvedValue;
        },

        getMockfn: (): jest.Mock<any> => fn,

        setCustomResolvedvalue: (o: T) => {
            __customUser = o;
            fn.mockResolvedValue(__customUser);
        },

        setDeleteCustomResolvedValue: (): void => {
            __customUser = null;
        },

        setMockResolveError: (errorMessage: string) => {
            __hasRejectValue = true;
            fn.mockRejectedValue(new Error(errorMessage));
        },
    };
}

export function mk_prismaUserMethod(prisma: PrismaClient) {
    return {
        update: mockHelper<UserDto>(prisma.users.update, createDefaultUserDb),
        create: mockHelper<UserDto>(prisma.users.create, createDefaultUserDb),
        delete: mockHelper<UserDto>(prisma.users.delete, createDefaultUserDb),
        findUniqueOrThrow: mockHelper<UserDto>(prisma.users.findUniqueOrThrow, createDefaultUserDb),
    };
}

export function mk_prismaProfileMethod(prisma: PrismaClient) {
    return {
        upsert: mockHelper<ProfileDto>(prisma.profiles.upsert, createDefaultProfileDb),
        delete: mockHelper<ProfileDto>(prisma.profiles.delete, createDefaultProfileDb),
        findUniqueOrThrow: mockHelper<ProfileDto>(prisma.profiles.findUniqueOrThrow, createDefaultProfileDb),
    };
}

export const createMockPrisma = (): DeepMockProxy<PrismaClient> => {
    return mockDeep<PrismaClient>();
};
