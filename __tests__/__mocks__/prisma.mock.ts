import { jest } from "@jest/globals";

export function createDefaultUserDb() {
    return {
        user_id: "123",
        email: "test@test.com",
        password: "hash123",
        role: "user",
        created_at: new Date("2024-01-01"),
        updated_at: new Date("2024-01-02"),
    };
}
export const createMockPrisma = () => ({
    users: {
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
});
