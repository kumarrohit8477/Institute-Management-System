import { Response } from "express";
import { PaymentService } from "../services/payment.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class PaymentController {
  static recordPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const receivedById = req.user?.id as string;
    const payment = await PaymentService.recordPayment(instituteId, receivedById, req.body);
    return ResponseHandler.created(res, payment, "Payment recorded and receipt generated successfully");
  });

  static getPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await PaymentService.getPayments(instituteId, req.query as any);
    return ResponseHandler.success(res, result.payments, "Payment transactions retrieved successfully", 200, result.meta);
  });

  static getPaymentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const payment = await PaymentService.getPaymentById(instituteId, req.params.id);
    return ResponseHandler.success(res, payment, "Payment receipt retrieved successfully");
  });
}
