import { Response } from "express";
import { TeacherService } from "../services/teacher.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class TeacherController {
  static createTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const teacher = await TeacherService.createTeacher(instituteId, req.body);
    return ResponseHandler.created(res, teacher, "Teacher added successfully");
  });

  static getTeachers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherService.getTeachers(instituteId, req.query as any);
    return ResponseHandler.success(res, result.teachers, "Teachers retrieved successfully", 200, result.meta);
  });

  static getTeacherById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const teacher = await TeacherService.getTeacherById(instituteId, req.params.id);
    return ResponseHandler.success(res, teacher, "Teacher profile retrieved successfully");
  });

  static updateTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await TeacherService.updateTeacher(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Teacher profile updated successfully");
  });

  static deleteTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherService.deleteTeacher(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Teacher removed successfully");
  });
}
