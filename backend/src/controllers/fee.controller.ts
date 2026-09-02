import { Response } from "express";
import { FeeService } from "../services/fee.service";
import { PaymentService } from "../services/payment.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class FeeController {
  // Admin Operations
  static createFee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const fee = await FeeService.createFee(instituteId, req.body);
    return ResponseHandler.created(res, fee, "Fee invoice generated successfully");
  });

  static getFees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await FeeService.getFees(instituteId, req.query as any);
    return ResponseHandler.success(
      res,
      { fees: result.fees, summary: result.summary },
      "Fee invoices retrieved successfully",
      200,
      result.meta
    );
  });

  static getFeeById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const fee = await FeeService.getFeeById(instituteId, req.params.id);
    return ResponseHandler.success(res, fee, "Fee invoice retrieved successfully");
  });

  static updateFee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await FeeService.updateFee(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Fee invoice updated successfully");
  });

  static deleteFee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await FeeService.deleteFee(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Fee invoice deleted successfully");
  });

  // Student Personalized Financial Overview
  static getMyFeeOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const overview = await PaymentService.getStudentFeeOverview(userId, instituteId);
    return ResponseHandler.success(res, overview, "Student financial overview retrieved successfully");
  });
}
