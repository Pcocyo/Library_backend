import z from "zod"
import { UserRole } from "../../../Controller/User/User"

export const CreateUserRequestSchema = z.object({
      email:z.string("Invalid email input format").email("Invalid email input format"),
      password:z
      .string()
      .min(8, "Password too short (min 8 characthers)")
      .max(32, "Password too long (max 8 characthers)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain one special character")
})

export const GetUserRequestSchema = z.object({
   email:z.string("Invalid email input format").email("Invalid email input format")
})

export const LoginUserRequestSchema = z.object({
      email:z.string("Invalid email input format").email("Invalid email input format"),
      password:z.string()
})

export const UpdateUserRequestSchema = z.object({
   userRole:z.nativeEnum(UserRole,"Invalid user role input (expected: MEMBER,GUEST,LIBRARIAN)"),
   email:z.string("Invalid email input format").email("Invalid email input format").nullable(),
   password:z
      .string()
      .min(8, "Password too short (min 8 characthers)")
      .max(32, "Password too long (max 8 characthers)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain one special character")
      .nullable()
})
