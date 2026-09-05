import { Response } from "express";
import { TeacherService } from "../services/teacher.service";
import { BatchSubjectService } from "../services/batchSubject.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { prisma } from "../config/prisma";

export class TeacherPortalController {
  /**
   * Get academic scope for logged in teacher (batches, subjects, timetable)
   */
  static getMyAcademicScope = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const data = await TeacherService.getTeacherAcademicScope(userId, instituteId);
    return ResponseHandler.success(res, data, "Teacher academic scope retrieved successfully");
  });

  /**
   * Update progress or notes of an assigned batch subject
   */
  static updateMyBatchSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const batchSubjectId = req.params.id;

    // Verify this batch subject is assigned to this teacher
    const teacher = await prisma.teacher.findFirst({
      where: { userId, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const batchSubject = await prisma.batchSubject.findFirst({
      where: { id: batchSubjectId, assignedTeacherId: teacher.id }
    });

    if (!batchSubject) {
      throw new AppError("You are not assigned to this batch subject", HTTP_STATUS.FORBIDDEN);
    }

    const { progress, status, notes } = req.body;
    const updated = await BatchSubjectService.updateBatchSubject(instituteId, batchSubjectId, {
      ...(progress !== undefined ? { progress } : {}),
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {})
    });

    return ResponseHandler.success(res, updated, "Subject progress updated successfully");
  });
}
