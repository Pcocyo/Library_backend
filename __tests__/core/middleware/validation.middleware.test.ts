import z from "zod";
import ValidationMiddleware from "../../../src/core/middleware/validation.middleware";
import { IValidationMiddleware } from "../../../src/core/middleware/types/validation.interface";
import { Request, Response } from "express";
import { ValidationErrorFactory } from "../../../src/core/error/exceptions";
describe("Validation Middleware test suite", () => {
    let middlewareInstance: IValidationMiddleware;
    let request: Partial<Request> = { headers: {}, body: {} };
    let response: Partial<Response> = {};
    let next = jest.fn();
    let validationErrorFactory_Mck: any;
    const validationErrorFactory_Mck_returnVal = "VALIDATION_ERROR";

    const testSchema = z.object({
        email: z.string(),
    });

    beforeAll(() => {
        middlewareInstance = new ValidationMiddleware();
        validationErrorFactory_Mck = jest.spyOn(
            ValidationErrorFactory,
            "createInvalidInputError",
      );
      validationErrorFactory_Mck.mockReturnValue(validationErrorFactory_Mck_returnVal);
    });

    afterAll(() => {
        validationErrorFactory_Mck.mockRestore();
    });

    afterEach(() => {
        request = { headers: {}, body: {} };
        request = {};
        response = {};
        validationErrorFactory_Mck.mockClear();
        next.mockClear();
    });

    it("Should call next() with a validation error if the request does not match the schema.", async () => {
        request.body = { email: 123 };
        let validationFunction = middlewareInstance.validate(testSchema);
        validationFunction(request as Request, response as Response, next);
        expect(validationErrorFactory_Mck).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBe(validationErrorFactory_Mck_returnVal);
    });

    it("Should call next() without modifying the request when schema validation succeeds", async () => {
        request.body = { email: "valid schema" };
        let validationFunction = middlewareInstance.validate(testSchema);
        validationFunction(request as Request, response as Response, next);
        expect(Object.keys(request).length).toEqual(1);
        expect(request.body).toHaveProperty("email")
        expect(next).toHaveBeenCalled();
    });
});
