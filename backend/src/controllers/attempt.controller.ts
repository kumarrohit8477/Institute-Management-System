import { Response } from "express";
import { AttemptService } from "../services/attempt.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class AttemptController {
  static startAttempt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await AttemptService.startAttempt(userId, req.params.testId, instituteId);
    return ResponseHandler.created(res, result, "Test attempt started successfully");
  });

  static saveAnswer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const answer = await AttemptService.saveAnswer(userId, req.params.testId, instituteId, req.body);
    return ResponseHandler.success(res, answer, "Answer recorded successfully");
  });

  static submitAttempt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const result = await AttemptService.submitAttempt(userId, req.params.testId, instituteId);
    return ResponseHandler.success(res, result, "Test submitted and evaluated successfully");
  });
}
