import { Response } from "express";
import { CourseService } from "../services/course.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class CourseController {
  static createCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const course = await CourseService.createCourse(instituteId, req.body);
    return ResponseHandler.created(res, course, "Course created successfully");
  });

  static getCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await CourseService.getCourses(instituteId, req.query as any);
    return ResponseHandler.success(res, result.courses, "Courses retrieved successfully", 200, result.meta);
  });

  static getCourseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const course = await CourseService.getCourseById(instituteId, req.params.id);
    return ResponseHandler.success(res, course, "Course details retrieved successfully");
  });

  static updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await CourseService.updateCourse(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Course updated successfully");
  });
}
