import { Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class AttendanceController {
  // Admin Endpoints
  static markBulkAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const recordedById = req.user?.id as string;
    const result = await AttendanceService.markBulkAttendance(instituteId, recordedById, req.body);
    return ResponseHandler.created(res, result, "Batch attendance recorded successfully");
  });

  static getBatchAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await AttendanceService.getBatchAttendance(instituteId, req.params.batchId, req.query as any);
    return ResponseHandler.success(res, result, "Batch attendance records retrieved successfully", 200, result.meta);
  });

  static updateAttendanceRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await AttendanceService.updateAttendanceRecord(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Attendance record updated successfully");
  });

  // Student Personalized Attendance
  static getMyAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await AttendanceService.getStudentAttendance(userId, instituteId, req.query as any);
    return ResponseHandler.success(res, result, "Student attendance profile retrieved successfully");
  });
}
