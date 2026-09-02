import { Response } from "express";
import { MaterialService } from "../services/material.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class MaterialController {
  // Admin Endpoints
  static createMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const uploadedById = req.user?.id as string;
    const material = await MaterialService.createMaterial(instituteId, uploadedById, req.body);
    return ResponseHandler.created(res, material, "Study material uploaded successfully");
  });

  static getMaterials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await MaterialService.getMaterials(instituteId, req.query as any);
    return ResponseHandler.success(res, result.materials, "Study materials retrieved successfully", 200, result.meta);
  });

  static getMaterialById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const material = await MaterialService.getMaterialById(instituteId, req.params.id);
    return ResponseHandler.success(res, material, "Study material details retrieved successfully");
  });

  static updateMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await MaterialService.updateMaterial(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Study material updated successfully");
  });

  static deleteMaterial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await MaterialService.deleteMaterial(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Study material deleted successfully");
  });

  // Student Personalized Materials Scoping
  static getMyMaterials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await MaterialService.getStudentMaterials(userId, instituteId, req.query as any);
    return ResponseHandler.success(res, result, "Student study materials retrieved successfully");
  });
}
