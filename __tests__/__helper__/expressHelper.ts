import { Response, Request, NextFunction } from "express";

export function expressHelper(default_request_attr: Record<string, any>) {

    let request_attributes = default_request_attr;
    return {
        setRequestAttributes: (parameter: Record<string, any>) => {
            request_attributes = { ...parameter };
        },
        getDefaultRequestAttributes: () => {
            return default_request_attr;
        },

        getRequestAttributes: () => {
            return request_attributes;
        },
        declareAllExpressPartials: (): {
            response: Partial<Response>;
            request: Partial<Request>;
            next: NextFunction;
        } => {
            let response_partial = {
                send: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            } as Partial<Response>;
            let request_partial: Partial<Request> = {
                body: {
                    ...request_attributes,
                },
            };
            return {
                response: response_partial,
                request: request_partial,
                next: jest.fn(),
            };
        },
    };
}
