import { Response } from "express";
import { QuestionService } from "../services/question.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class QuestionController {
  static createQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const question = await QuestionService.createQuestion(instituteId, req.body);
    return ResponseHandler.created(res, question, "Question created in Question Bank successfully");
  });

  static getQuestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await QuestionService.getQuestions(instituteId, req.query as any);
    return ResponseHandler.success(res, result.questions, "Questions retrieved successfully", 200, result.meta);
  });

  static getQuestionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const question = await QuestionService.getQuestionById(instituteId, req.params.id);
    return ResponseHandler.success(res, question, "Question retrieved successfully");
  });

  static updateQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await QuestionService.updateQuestion(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Question updated successfully");
  });

  static deleteQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await QuestionService.deleteQuestion(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Question deleted successfully");
  });
}
