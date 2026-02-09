import AuthMiddleware from "../../../src/core/middleware/auth.middleware";
import { IAuthMiddleware } from "../../../src/core/middleware/types";
import { ClientErrorFactory } from "../../../src/core/error/exceptions";
import { ErrorMapperGroup } from "../../../src/core/error/mappers/ErrorMapperGroup";
import { Request, Response } from "express";
import JwtService from "../../../src/core/security/jwt.service";
import { IJwtService } from "../../../src/core/security/interfaces";

function createMockJwt(): IJwtService {
    let jwtService: JwtService = new JwtService({
        JWT_SECRET: "test-secrets",
    });
    jwtService.validateJwtToken = jest.fn().mockResolvedValue({
        email: "userEmail",
        role: "GUEST",
        id: "librarian",
    });
    return jwtService;
}
describe("Authorization middleware", () => {
    let mockReq: Partial<Request> = { headers: {}, body: {} };
    let mockRes: Partial<Response> = {};
    let nextFunction = jest.fn();
    let jwtAuthMiddleware: any;
    let authInstance: IAuthMiddleware;
    let mockJwtService: IJwtService;

    let unauthorizedRequestError: any;
    let errorMapperGroup: any;
    let spyMethod = () => {
        unauthorizedRequestError = jest.spyOn(
            ClientErrorFactory,
            "createUnauthorizedRequestError",
        );
        errorMapperGroup = jest.spyOn(ErrorMapperGroup, "getInstance");
    };

    beforeAll(() => {
        mockJwtService = createMockJwt();
        authInstance = new AuthMiddleware(mockJwtService);
        spyMethod();
    });

    beforeEach(() => {
        jwtAuthMiddleware =
            authInstance.CreateValidateTokenMiddleware(undefined);
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("Middleware Should insert the AccessTokenPayload into the User request object.", async () => {
        mockReq.headers = { authorization: "valid token" };
        await jwtAuthMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body).toHaveProperty("authorizedUser");
    });

    it("Middleware should execute normally if option.required role succeeded  ", async () => {
        mockReq.headers = { authorization: "valid token" };
        jwtAuthMiddleware = authInstance.CreateValidateTokenMiddleware({
            option: { required_role: "GUEST" },
        });
        await jwtAuthMiddleware(mockReq, mockRes, nextFunction);
        expect(mockReq.body).toHaveProperty("authorizedUser");
    });

    it("Middleware should throw an UnauthorizedRequestError if the option.required role fails or is configured incorrectly", async () => {
        mockReq.headers = { authorization: "valid token" };
        jwtAuthMiddleware = authInstance.CreateValidateTokenMiddleware({
            option: { required_role: "MEMBER" },
        });
        await jwtAuthMiddleware(mockReq, mockRes, nextFunction);
        expect(unauthorizedRequestError).toHaveBeenCalled();
    });

    it("Middleware should throw an UnauthorizedRequestError when an unauthorized access request / request without token detected", async () => {
        await jwtAuthMiddleware(mockReq, mockRes, nextFunction);
        expect(unauthorizedRequestError).toHaveBeenCalled();
    });
});
