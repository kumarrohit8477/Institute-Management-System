import { Response } from "express";
import { TeacherAssignmentService } from "../services/teacherAssignment.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class AssignmentController {
  // --- TEACHER SUBJECT QUALIFICATION ---
  static assignTeacherSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherAssignmentService.assignTeacherToSubject(
      instituteId,
      req.params.teacherId,
      req.body.subjectId
    );
    return ResponseHandler.created(res, result, "Subject assigned to teacher successfully");
  });

  static getTeacherSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const subjects = await TeacherAssignmentService.getTeacherSubjects(instituteId, req.params.teacherId);
    return ResponseHandler.success(res, subjects, "Teacher subjects retrieved successfully");
  });

  static removeTeacherSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherAssignmentService.removeTeacherSubject(
      instituteId,
      req.params.teacherId,
      req.params.subjectId
    );
    return ResponseHandler.success(res, result, "Subject qualification removed from teacher");
  });

  // --- TEACHER BATCH ASSIGNMENT ---
  static assignTeacherBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherAssignmentService.assignTeacherToBatch(instituteId, req.body);
    return ResponseHandler.created(res, result, "Teacher assigned to batch successfully");
  });

  static getBatchAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const assignments = await TeacherAssignmentService.getBatchAssignments(instituteId, req.params.batchId);
    return ResponseHandler.success(res, assignments, "Batch teacher assignments retrieved successfully");
  });

  static removeAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TeacherAssignmentService.removeAssignment(instituteId, req.params.assignmentId);
    return ResponseHandler.success(res, result, "Teacher assignment removed successfully");
  });
}
