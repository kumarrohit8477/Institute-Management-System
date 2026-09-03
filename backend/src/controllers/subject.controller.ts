import { Response } from "express";
import { SubjectService } from "../services/subject.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class SubjectController {
  static createSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const subject = await SubjectService.createSubject(instituteId, req.body);
    return ResponseHandler.created(res, subject, "Subject created successfully");
  });

  static getSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await SubjectService.getSubjects(instituteId, req.query as any);
    return ResponseHandler.success(res, result.subjects, "Subjects retrieved successfully", 200, result.meta);
  });

  static getSubjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const subject = await SubjectService.getSubjectById(instituteId, req.params.id);
    return ResponseHandler.success(res, subject, "Subject details retrieved successfully");
  });

  static updateSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await SubjectService.updateSubject(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Subject updated successfully");
  });

  static deleteSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await SubjectService.deleteSubject(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Subject deleted successfully");
  });
}
