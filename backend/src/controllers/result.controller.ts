import { Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { ResponseHandler } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types";

export class ResultController {
  /**
   * Get all test results for authenticated student
   */
  static getMyResults = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;

    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
    }

    const results = await prisma.result.findMany({
      where: {
        instituteId,
        studentId: student.id
      },
      orderBy: { createdAt: "desc" },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            totalMarks: true,
            passingMarks: true,
            startTime: true,
            endTime: true,
            subject: { select: { id: true, name: true, code: true } }
          }
        },
        attempt: {
          select: {
            id: true,
            startedAt: true,
            submittedAt: true,
            totalAttempted: true,
            totalCorrect: true,
            totalIncorrect: true
          }
        }
      }
    });

    return ResponseHandler.success(res, results, "Student results retrieved successfully");
  });

  /**
   * Get detailed result for a specific test
   */
  static getTestResult = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id as string;
    const instituteId = req.instituteId as string;
    const { testId } = req.params;

    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
    }

    const result = await prisma.result.findFirst({
      where: {
        instituteId,
        testId,
        studentId: student.id
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            totalMarks: true,
            passingMarks: true
          }
        },
        attempt: {
          include: {
            studentAnswers: {
              include: {
                question: {
                  include: {
                    options: { orderBy: { sortOrder: "asc" } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!result) {
      throw new AppError("Result not found for this test", HTTP_STATUS.NOT_FOUND);
    }

    return ResponseHandler.success(res, result, "Test result retrieved successfully");
  });

  /**
   * Get Leaderboard / Rank list for a test
   */
  static getTestLeaderboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instituteId = req.instituteId as string;
    const { testId } = req.params;

    const results = await prisma.result.findMany({
      where: {
        instituteId,
        testId
      },
      orderBy: [{ rank: "asc" }, { totalMarksObtained: "desc" }],
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return ResponseHandler.success(res, results, "Test leaderboard retrieved successfully");
  });
}
