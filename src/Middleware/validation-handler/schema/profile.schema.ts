import z from "zod"
import { ProfileStatus } from "../../../Controller/Profile/Profile.interface"
export const ProfileUpdateRequestSchema = z.object({
   user_name: z
      .string()
      .min(3,"user name too short (min 3 characther)")
      .max(32,"user name too long (max 32 characther)")
      .regex(/^\S+$/,"user name cannot contain any whitespace")
      .nullable(),
   first_name: z
      .string()
      .min(3,"first name too short (min 3 characther)")
      .max(32,"first name too long (max 32 characther)")
      .regex(/^\S+$/,"user first name cannot contain any whitespace")
      .nullable(),
   last_name: z
      .string()
      .min(3,"last name too short (min 3 characther)")
      .max(32,"last name too long (max 32 characther)")
      .regex(/^\S+$/,"user last name cannot contain any whitespace")
      .nullable(),
   contact: z
      .string()
      .min(7,"contact information too short (min 7 characther)")
      .max(15,"contact information too long (max 15 characther)")
      .regex(/^[0-9]+$/,"contact information contain non-numeric characther")
      .nullable(),
   address:z
      .string()
      .min(1,"address information cannot be empty")
      .nullable()
})

export const LibrarianUpdateProfileRequestSchema = z.object({
   total_fines: z
      .number("invalid total fines input")
      .nullable(),
   status: z.nativeEnum(ProfileStatus,"invalid status input (expected: ACTIVE,BANNED,SUSPENDED)").nullable(),
   email: z.string().email("invalid email input")
})
