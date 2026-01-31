import type { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../features/user/types/user-service.types";

export interface UserJwtPayloadInterface extends JwtPayload {
    userEmail: string;
    userRole: UserRole;
    userId: string;
}
