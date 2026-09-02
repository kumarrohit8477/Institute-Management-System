import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email or Student ID is required" })
      .min(1, "Email or Student ID cannot be empty"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    instituteCode: z.string().optional()
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: "Refresh token is required" })
      .min(10, "Invalid refresh token format")
  })
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  }).optional()
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
