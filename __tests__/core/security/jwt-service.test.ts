import { IJwtService } from "../../../src/core/security/interfaces";
import JwtService from "../../../src/core/security/jwt.service";
import { ISecurityConfig } from "../../../src/config/config.interface";
import jwt from "jsonwebtoken";

describe("Jwt Service Test", () => {
    let jwtService: IJwtService;
    let mockConfig: jest.Mocked<ISecurityConfig>;

    let dummyEmail: string = "dummyEmail";
    let dummyRole: string = "dummyRole";
    let dummyId: string = "dummyId";

    beforeEach(() => {
        mockConfig = {
            JWT_SECRET: "test-jwt-secret",
        };
        jwtService = new JwtService(mockConfig);
    });

    it("Should generate jwt token that contain correct data", () => {
        let token = jwtService.generateJwtToken({
            email: dummyEmail,
            id: dummyId,
            role: dummyRole,
        });
        const decode = jwt.verify(token, mockConfig.JWT_SECRET);
        expect(token).not.toBe(null);
        expect(decode).toHaveProperty("email");
        expect(decode).toHaveProperty("id");
        expect(decode).toHaveProperty("role");
    });

    it("Should validate jwt token when given data", () => {
        const jwtToken: string = jwt.sign(
            {
                email: dummyEmail,
                role: dummyRole,
                id: dummyId,
            },
            mockConfig.JWT_SECRET,
        );
        const decode = jwtService.validateJwtToken(jwtToken);
        expect(decode.email).toBe(dummyEmail);
        expect(decode.role).toBe(dummyRole);
        expect(decode.id).toBe(dummyId);
    });
});
