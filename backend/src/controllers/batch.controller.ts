import { Response } from "express";
import { BatchService } from "../services/batch.service";
import { StudentBatchService } from "../services/studentBatch.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class BatchController {
  // --- BATCH CRUD ---
  static createBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const batch = await BatchService.createBatch(instituteId, req.body);
    return ResponseHandler.created(res, batch, "Batch created successfully");
  });

  static getBatches = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchService.getBatches(instituteId, req.query as any);
    return ResponseHandler.success(res, result.batches, "Batches retrieved successfully", 200, result.meta);
  });

  static getBatchById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const batch = await BatchService.getBatchById(instituteId, req.params.id);
    return ResponseHandler.success(res, batch, "Batch details retrieved successfully");
  });

  static updateBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await BatchService.updateBatch(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Batch updated successfully");
  });

  static deleteBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await BatchService.deleteBatch(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Batch deleted successfully");
  });

  // --- STUDENT BATCH ASSIGNMENT ---
  static assignStudent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await StudentBatchService.assignStudentToBatch(instituteId, req.params.batchId, req.body);
    return ResponseHandler.created(res, result, "Student assigned to batch successfully");
  });

  static getBatchStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await StudentBatchService.getBatchStudents(instituteId, req.params.batchId);
    return ResponseHandler.success(res, result, "Batch students retrieved successfully");
  });

  static updateStudentBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await StudentBatchService.updateStudentBatch(
      instituteId,
      req.params.batchId,
      req.params.studentId,
      req.body
    );
    return ResponseHandler.success(res, updated, "Student batch details updated successfully");
  });

  static removeStudentFromBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await StudentBatchService.removeStudentFromBatch(
      instituteId,
      req.params.batchId,
      req.params.studentId
    );
    return ResponseHandler.success(res, result, "Student removed from batch successfully");
  });
}
