import { jest } from "@jest/globals";
import { Decimal } from "@prisma/client/runtime/library";

export function createDefaultUserDb() {
    return {
        user_id: "123",
        email: "test@test.com",
        password: "hash123",
        role: "user",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
   }
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

export const createMockPrisma = () => ({
    users: {
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
    profiles: {
        upsert: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
    }
});
