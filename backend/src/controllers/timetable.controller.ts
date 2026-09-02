import { Response } from "express";
import { TimetableService } from "../services/timetable.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class TimetableController {
  // Admin Endpoints
  static createTimetable = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const timetable = await TimetableService.createTimetable(instituteId, req.body);
    return ResponseHandler.created(res, timetable, "Class schedule created successfully");
  });

  static getTimetables = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TimetableService.getTimetables(instituteId, req.query as any);
    return ResponseHandler.success(res, result.timetables, "Timetables retrieved successfully", 200, result.meta);
  });

  static getTimetableById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const slot = await TimetableService.getTimetableById(instituteId, req.params.id);
    return ResponseHandler.success(res, slot, "Timetable slot retrieved successfully");
  });

  static updateTimetable = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await TimetableService.updateTimetable(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Timetable slot updated successfully");
  });

  static deleteTimetable = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TimetableService.deleteTimetable(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Timetable slot deleted successfully");
  });

  // Student Personalized Schedule
  static getMySchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const schedule = await TimetableService.getStudentSchedule(userId, instituteId);
    return ResponseHandler.success(res, schedule, "Student schedule retrieved successfully");
  });
}
