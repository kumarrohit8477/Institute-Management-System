import { Response } from "express";
import { StudentService } from "../services/student.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class StudentController {
  static createStudent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const student = await StudentService.createStudent(instituteId, req.body);
    return ResponseHandler.created(res, student, "Student registered successfully");
  });

  static getStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await StudentService.getStudents(instituteId, req.query as any);
    return ResponseHandler.success(res, result.students, "Students retrieved successfully", 200, result.meta);
  });

  static getStudentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const student = await StudentService.getStudentById(instituteId, req.params.id);
    return ResponseHandler.success(res, student, "Student details retrieved successfully");
  });

  static updateStudent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await StudentService.updateStudent(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Student updated successfully");
  });

  static getMyAcademics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const academics = await StudentService.getStudentAcademics(userId, instituteId);
    return ResponseHandler.success(res, academics, "Student academic summary retrieved successfully");
  });
}
