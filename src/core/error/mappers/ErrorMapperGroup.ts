import { JwtErrorMapper } from "./ErrorMapperClass/JwtErrorMapper";
import { PrismaErrorMapper } from "./ErrorMapperClass/PrismaErrorMapper";
import { ErrorMapperClass } from "./ErrorMapperClass/ErrorMapperClass.interface";
import { BaseError } from "../exceptions";

export class ErrorMapperGroup {
    private static instance: ErrorMapperGroup;
    private errorMapper: ErrorMapperClass<any, any>[] = [];
    constructor() {
        this.errorMapper.push(new JwtErrorMapper());
        this.errorMapper.push(new PrismaErrorMapper());
    }

    public mapError(error: unknown): BaseError | unknown {
        for (const mapper of this.errorMapper) {
            if (mapper.handle(error)) {
                return mapper.map(error);
            }
        }
        return error;
    }

    public static getInstance(): ErrorMapperGroup {
        if (!ErrorMapperGroup.instance) {
            ErrorMapperGroup.instance = new ErrorMapperGroup();
            return ErrorMapperGroup.instance;
        }
        return ErrorMapperGroup.instance;
    }
}
