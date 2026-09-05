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

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .min(1, "Current password cannot be empty"),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "New password must be at least 8 characters long")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/[0-9]/, "New password must contain at least one number"),
      confirmPassword: z
        .string({ required_error: "Password confirmation is required" })
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirmation do not match",
      path: ["confirmPassword"]
    })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address")
  })
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z
        .string({ required_error: "Reset token is required" })
        .min(1, "Reset token is required"),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(8, "New password must be at least 8 characters long")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/[0-9]/, "New password must contain at least one number"),
      confirmPassword: z
        .string({ required_error: "Password confirmation is required" })
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirmation do not match",
      path: ["confirmPassword"]
    })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
