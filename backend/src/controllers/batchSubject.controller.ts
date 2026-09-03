import { Response } from "express";
import { BatchSubjectService } from "../services/batchSubject.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class BatchSubjectController {
  static addSubjectToBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchSubjectService.addSubjectToBatch(
      instituteId,
      req.params.batchId,
      req.body
    );
    return ResponseHandler.created(res, result, "Subject added to batch successfully");
  });

  static getBatchSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchSubjectService.getBatchSubjects(
      instituteId,
      req.params.batchId
    );
    return ResponseHandler.success(res, result, "Batch subjects retrieved successfully");
  });

  static updateBatchSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchSubjectService.updateBatchSubject(
      instituteId,
      req.params.id,
      req.body
    );
    return ResponseHandler.success(res, result, "Batch subject updated successfully");
  });

  static assignTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchSubjectService.assignTeacher(
      instituteId,
      req.params.id,
      req.body.teacherId
    );
    return ResponseHandler.success(res, result, "Teacher assigned to batch subject successfully");
  });

  static removeBatchSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchSubjectService.removeBatchSubject(
      instituteId,
      req.params.id
    );
    return ResponseHandler.success(res, result, "Subject removed from batch successfully");
  });
}
