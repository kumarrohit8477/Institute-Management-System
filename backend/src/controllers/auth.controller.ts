import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { BootstrapService } from "../services/bootstrap.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class AuthController {
  /**
   * POST /api/v1/auth/login or /api/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return ResponseHandler.success(res, result, "Login successful");
  });

  /**
   * POST /api/v1/auth/refresh or /api/auth/refresh
   */
  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshAccessToken(refreshToken);
    return ResponseHandler.success(res, result, "Token refreshed successfully");
  });

  static refreshToken = AuthController.refresh;

  /**
   * POST /api/v1/auth/logout or /api/auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (userId) {
      await AuthService.logout(userId);
    }
    return ResponseHandler.success(res, { loggedOut: true }, "Logged out successfully");
  });

  /**
   * GET /api/v1/auth/me or /api/auth/me
   */
  static getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const profile = await AuthService.getMe(userId);
    return ResponseHandler.success(res, profile, "Profile fetched successfully");
  });

  /**
   * GET /api/v1/auth/super-admin/bootstrap-status
   */
  static getBootstrapStatus = asyncHandler(async (_req: Request, res: Response) => {
    const status = await BootstrapService.getBootstrapStatus();
    return ResponseHandler.success(res, status, "Bootstrap status retrieved successfully");
  });

  /**
   * POST /api/v1/auth/super-admin/bootstrap
   * Single-use retrieval of initial temporary password
   */
  static claimOneTimeBootstrap = asyncHandler(async (_req: Request, res: Response) => {
    const result = BootstrapService.claimOneTimeSetup();
    return ResponseHandler.success(res, result, result.message);
  });

  /**
   * POST /api/v1/auth/change-password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const result = await AuthService.changePassword(userId, req.body);
    return ResponseHandler.success(res, result, result.message);
  });

  /**
   * POST /api/v1/auth/forgot-password or /api/v1/auth/super-admin/forgot-password
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body);
    return ResponseHandler.success(res, result, result.message);
  });

  /**
   * POST /api/v1/auth/reset-password or /api/v1/auth/super-admin/reset-password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);
    return ResponseHandler.success(res, result, result.message);
  });
}
