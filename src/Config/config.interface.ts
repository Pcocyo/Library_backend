import { UserRole } from "../Controller/User/User.ts";
import type { JwtPayload } from "jsonwebtoken";

export interface UserJwtPayloadInterface extends JwtPayload {
    userEmail: string;
    userRole: UserRole;
    userId: string;
}
