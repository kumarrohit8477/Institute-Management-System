import { Response } from "express";
import { InstituteService } from "../services/institute.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";

export class InstituteController {
  /**
   * GET /api/v1/institute/current or /api/institute/current
   * Retrieve current institute details and branding
   */
  static getCurrentInstitute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId || (req.query.instituteId as string);
    if (!instituteId) {
      throw new AppError("No institute context found", HTTP_STATUS.BAD_REQUEST);
    }

    const institute = await InstituteService.getCurrentInstitute(instituteId);
    return ResponseHandler.success(res, institute, "Institute details retrieved successfully");
  });

  /**
   * POST /api/v1/institute/logo or /api/institute/logo
   * Upload or change institute branding logo
   */
  static uploadLogo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId || req.body.instituteId;
    if (!instituteId) {
      throw new AppError("Institute context is required", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await InstituteService.updateLogo(instituteId, req.body);
    return ResponseHandler.success(res, updated, "Institute logo updated successfully");
  });

  /**
   * DELETE /api/v1/institute/logo or /api/institute/logo
   * Remove current institute branding logo
   */
  static deleteLogo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId || req.body.instituteId;
    if (!instituteId) {
      throw new AppError("Institute context is required", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await InstituteService.deleteLogo(instituteId);
    return ResponseHandler.success(res, updated, "Institute logo removed successfully");
  });

  /**
   * PUT /api/v1/institute/tagline or PATCH /api/v1/institute/tagline
   * Update or remove institute tagline / slogan
   */
  static updateTagline = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId || req.body.instituteId;
    if (!instituteId) {
      throw new AppError("Institute context is required", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await InstituteService.updateTagline(instituteId, req.body.tagline);
    return ResponseHandler.success(res, updated, "Institute tagline updated successfully");
  });

  /**
   * PUT /api/v1/institute/profile or PATCH /api/v1/institute/profile
   * Update institute contact / profile information
   */
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId || req.body.instituteId;
    if (!instituteId) {
      throw new AppError("Institute context is required", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await InstituteService.updateProfile(instituteId, req.body);
    return ResponseHandler.success(res, updated, "Institute profile updated successfully");
  });
}
