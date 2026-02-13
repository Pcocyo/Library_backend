import { Request, Response, NextFunction } from "express";

export interface IProfileController {

    updateUserProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;

    librarianUpdateUserProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;

    subscribe(req: Request, res: Response, next: NextFunction): Promise<void>;
}
