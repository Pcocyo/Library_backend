import { UserRole } from "../Controller/User/User";
import type { JwtPayload } from "jsonwebtoken";

export interface UserJwtPayloadInterface extends JwtPayload {
    userEmail: string;
    userRole: UserRole;
    userId: string;
}
