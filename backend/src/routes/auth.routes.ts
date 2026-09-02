import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, validateRequest } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema
} from "../validations/auth.validation";

const router = Router();

// Public routes with rate limiting
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

// Protected routes
router.post(
  "/logout",
  authenticate,
  validateRequest(logoutSchema),
  AuthController.logout
);

router.get("/me", authenticate, AuthController.getMe);

export const authRoutes = router;
