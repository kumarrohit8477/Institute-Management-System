import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, validateRequest } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { createInstituteTenantSchema } from "../validations/saas.validation";
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../validations/auth.validation";

const router = Router();

// Super Admin Bootstrap & One-Time Credentials Endpoints
router.get("/super-admin/bootstrap-status", AuthController.getBootstrapStatus);
router.post("/super-admin/bootstrap", AuthController.claimOneTimeBootstrap);

// Public routes with rate limiting
router.post(
  "/register-institute",
  authRateLimiter,
  validateRequest(createInstituteTenantSchema),
  AuthController.registerInstitute
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  "/refresh",
  authRateLimiter,
  validateRequest(refreshTokenSchema),
  AuthController.refreshToken
);

// Forgot Password & Reset Password
router.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/super-admin/forgot-password",
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  "/super-admin/reset-password",
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected routes
router.post(
  "/logout",
  authenticate,
  validateRequest(logoutSchema),
  AuthController.logout
);

router.get("/me", authenticate, AuthController.getMe);

router.post(
  "/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  AuthController.changePassword
);

router.post(
  "/super-admin/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  AuthController.changePassword
);

export const authRoutes = router;
