import { Response } from "express";
import { CourseSubjectService } from "../services/courseSubject.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class CourseSubjectController {
  static addSubjectToCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await CourseSubjectService.addSubjectToCourse(
      instituteId,
      req.params.courseId,
      req.body
    );
    return ResponseHandler.created(res, result, "Subject added to course curriculum successfully");
  });

  static getCourseSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await CourseSubjectService.getCourseSubjects(
      instituteId,
      req.params.courseId
    );
    return ResponseHandler.success(res, result, "Course subjects retrieved successfully");
  });

  static updateCourseSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await CourseSubjectService.updateCourseSubject(
      instituteId,
      req.params.courseId,
      req.params.subjectId,
      req.body
    );
    return ResponseHandler.success(res, result, "Course subject updated successfully");
  });

  static removeSubjectFromCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await CourseSubjectService.removeSubjectFromCourse(
      instituteId,
      req.params.courseId,
      req.params.subjectId
    );
    return ResponseHandler.success(res, result, "Subject removed from course curriculum successfully");
  });
}
