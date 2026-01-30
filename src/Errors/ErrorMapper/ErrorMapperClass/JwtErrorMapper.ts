import jwt from "jsonwebtoken";
import { ErrorMapperClass } from "./ErrorMapperClass.interface";
import { ClientError, ClientErrorFactory } from "../../ErrorClass";
type JwtError =
    | jwt.NotBeforeError
    | jwt.JsonWebTokenError
    | jwt.TokenExpiredError;

export class JwtErrorMapper implements ErrorMapperClass<JwtError, ClientError> {
    handle(error: unknown): error is JwtError {
        return (
            error instanceof jwt.NotBeforeError ||
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError
        );
    }

    map(error: jwt.JsonWebTokenError, context?: any): ClientError {
        if (error instanceof jwt.TokenExpiredError) {
            return ClientErrorFactory.createUnauthorizedRequestError({
                message: "Unauthorized Request",
                context: { jwtError: { ...error }, input: context },
            });
        }
        if (error instanceof jwt.NotBeforeError) {
            return ClientErrorFactory.createUnauthorizedRequestError({
                message: "Unauthorized Request",
                context: { jwtError: { ...error }, input: context },
            });
        } else {
            return ClientErrorFactory.createUnauthorizedRequestError({
                message: "Unauthorized Request",
                context: { jwtError: { ...error }, input: context },
            });
        }
    }
}
