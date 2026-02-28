import {
    AccessTokenPayload,
    IJwtService,
} from "../../../src/core/security/interfaces";
import JwtService from "../../../src/core/security/jwt.service";
import { ISecurityConfig } from "../../../src/config/config.interface";
import { ErrorMapperGroup } from "../../../src/core/error/mappers/ErrorMapperGroup";
import jwt from "jsonwebtoken";
import {
    getMockCalls,
    setMockRejectValueSync,
} from "../../__helper__/mockHelper";

jest.mock("jsonwebtoken", () => ({
    ...jest.requireActual("jsonwebtoken"),
    sign: jest.fn(),
    verify: jest.fn(),
}));

jest.mock("../../../src/core/error/mappers/ErrorMapperGroup", () => ({
    ErrorMapperGroup: {
        getInstance: jest.fn().mockReturnValue({
            mapError: jest.fn().mockImplementation((error) => error),
        }),
    },
}));

describe("Jwt Service Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });
    let jwtService: IJwtService;
    let mockConfig: jest.Mocked<ISecurityConfig>;
    let jwtMockedSign: jest.Mock = jwt.sign as jest.Mock;
    let jwtMockedVerify: jest.Mock = jwt.verify as jest.Mock;
    let mockedMapError: jest.Mock = ErrorMapperGroup.getInstance()
        .mapError as jest.Mock;

    let dummyEmail: string = "dummyEmail";
    let dummyRole: string = "dummyRole";
    let dummyId: string = "dummyId";

    beforeEach(() => {
        mockConfig = {
            JWT_SECRET: "test-jwt-secret",
            BCRYPT_SALT: 1,
        };
        jwtService = new JwtService(mockConfig);

    });
    afterAll(()=>{
      jest.resetAllMocks();
   })
    describe("generateJwtToken()", () => {
        beforeEach(() => {
            jwtMockedSign.mockReturnValue("signed token");
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("Should generate jwt token that contain correct data", () => {
            let token = jwtService.generateJwtToken({
                email: dummyEmail,
                id: dummyId,
                role: dummyRole,
            });
            expect(jwtMockedSign).toHaveBeenCalled();
            expect(getMockCalls(jwtMockedSign)).toHaveProperty("email");
            expect(getMockCalls(jwtMockedSign)).toHaveProperty("role");
            expect(getMockCalls(jwtMockedSign)).toHaveProperty("id");

            expect(getMockCalls(jwtMockedSign).email).toBe(dummyEmail);
            expect(getMockCalls(jwtMockedSign).role).toBe(dummyRole);
            expect(getMockCalls(jwtMockedSign).id).toBe(dummyId);
        });

        it("Should return generated jwt token", () => {
            let token = jwtService.generateJwtToken({
                email: dummyEmail,
                id: dummyId,
                role: dummyRole,
            });
            expect(token).toBe("signed token");
        });

        it("Should call ErrorMapperGroup mapError when operation failed", () => {
            setMockRejectValueSync(jwtMockedSign, "jwtError");
            let jwtToken = "jwtTestToken";

            expect(() => {
                jwtService.generateJwtToken({
                    email: dummyEmail,
                    id: dummyId,
                    role: dummyRole,
                });
            }).toThrow();
            expect(mockedMapError).toHaveBeenCalled();
        });
    });
    describe("validateJwtToken()", () => {
        beforeEach(() => {
            mockedMapError.mockClear();
            jwtMockedVerify.mockReturnValue({
                email: "dummyEmail",
                role: "dummyRole",
                id: "dummyId",
            });
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        afterAll(() => {
            jest.resetAllMocks();
        });

        it("Should validate jwt token when given data", () => {
            let jwtToken = "jwtTestToken";
            jwtService.validateJwtToken(jwtToken) as AccessTokenPayload;
            expect(jwtMockedVerify).toHaveBeenCalled();
            expect(getMockCalls(jwtMockedVerify)).toBe(jwtToken);
        });

        it("Should return AccessTokenPayload on success", () => {
            let jwtToken = "jwtTestToken";
            const decode: AccessTokenPayload = jwtService.validateJwtToken(
                jwtToken,
            ) as AccessTokenPayload;
            expect(decode.email).toBe("dummyEmail");
            expect(decode.role).toBe("dummyRole");
            expect(decode.id).toBe("dummyId");
        });

        it("Should call ErrorMapperGroup mapError when operation failed", () => {
            setMockRejectValueSync(jwtMockedVerify, "jwtError");
            let jwtToken = "jwtTestToken";
            expect(() => jwtService.validateJwtToken(jwtToken)).toThrow();
            expect(mockedMapError).toHaveBeenCalled();
        });
    });
});
