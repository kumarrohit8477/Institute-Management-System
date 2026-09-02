import { Response } from "express";
import { TestService } from "../services/test.service";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";
import { UserRole } from "@prisma/client";

export class TestController {
  static createTest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const test = await TestService.createTest(instituteId, req.body);
    return ResponseHandler.created(res, test, "Test created successfully");
  });

  static getTests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const userRole = (req.user?.role as UserRole) || UserRole.STUDENT;
    const userId = req.user?.id;
    const result = await TestService.getTests(instituteId, req.query as any, userRole, userId);
    return ResponseHandler.success(res, result.tests, "Tests retrieved successfully", 200, result.meta);
  });

  static getTestById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const userRole = (req.user?.role as UserRole) || UserRole.STUDENT;
    const userId = req.user?.id;
    const test = await TestService.getTestById(instituteId, req.params.id, userRole, userId);
    return ResponseHandler.success(res, test, "Test details retrieved successfully");
  });

  static updateTest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const updated = await TestService.updateTest(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, updated, "Test updated successfully");
  });

  static addQuestionsToTest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TestService.addQuestionsToTest(instituteId, req.params.id, req.body);
    return ResponseHandler.success(res, result, "Questions linked to test successfully");
  });

  static removeQuestionFromTest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TestService.removeQuestionFromTest(instituteId, req.params.id, req.params.questionId);
    return ResponseHandler.success(res, result, "Question removed from test successfully");
  });

  static deleteTest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const result = await TestService.deleteTest(instituteId, req.params.id);
    return ResponseHandler.success(res, result, "Test deleted successfully");
  });
}
