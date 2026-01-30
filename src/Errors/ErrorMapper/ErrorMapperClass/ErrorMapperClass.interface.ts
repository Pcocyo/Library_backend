export interface ErrorMapperClass<InputError, OutputError> {
    map(error: InputError, context?: Record<string, any>): OutputError;
    handle(error: unknown): error is InputError;
}
