import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { AttemptStatus } from "@prisma/client";
import { SaveAnswerInput } from "../validations/attempt.validation";
import { EvaluationService } from "./evaluation.service";

export class AttemptService {
  /**
   * Start a new test attempt or resume an in-progress attempt (Student)
   */
  static async startAttempt(userId: string, testId: string, instituteId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { batches: { where: { status: "ACTIVE" } } }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const test = await prisma.test.findFirst({
      where: { id: testId, instituteId },
      include: {
        testQuestions: {
          include: {
            question: {
              include: {
                options: { orderBy: { sortOrder: "asc" } }
              }
            }
          },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!test) {
      throw new AppError("Test not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!test.isPublished) {
      throw new AppError("This test is not published yet", HTTP_STATUS.FORBIDDEN);
    }

    // Check batch eligibility
    if (test.batchId) {
      const isEnrolled = student.batches.some((b) => b.batchId === test.batchId);
      if (!isEnrolled) {
        throw new AppError("You are not enrolled in the batch for this test", HTTP_STATUS.FORBIDDEN);
      }
    }

    // Check test schedule window
    const now = new Date();
    if (now < new Date(test.startTime)) {
      throw new AppError("Test has not started yet", HTTP_STATUS.BAD_REQUEST);
    }
    if (now > new Date(test.endTime)) {
      throw new AppError("Test deadline has passed", HTTP_STATUS.BAD_REQUEST);
    }

    // Check existing attempt
    let attempt = await prisma.testAttempt.findUnique({
      where: { testId_studentId: { testId, studentId: student.id } },
      include: { studentAnswers: true }
    });

    if (attempt) {
      if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.EVALUATED) {
        throw new AppError("You have already completed and submitted this test", HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      attempt = await prisma.testAttempt.create({
        data: {
          testId,
          studentId: student.id,
          startedAt: now,
          status: AttemptStatus.IN_PROGRESS
        },
        include: { studentAnswers: true }
      });
    }

    // Calculate remaining seconds
    const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
    const totalAllowedSeconds = test.durationMinutes * 60;
    const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

    // If time has already expired, auto-submit!
    if (remainingSeconds <= 0) {
      return EvaluationService.evaluateAttempt(attempt.id);
    }

    // Sanitize questions (mask correct options and explanations)
    const sanitizedQuestions = test.testQuestions.map((tq) => ({
      id: tq.id,
      questionId: tq.question.id,
      sectionName: tq.sectionName,
      sortOrder: tq.sortOrder,
      marks: tq.marks,
      negativeMarks: tq.negativeMarks,
      question: {
        id: tq.question.id,
        subjectId: tq.question.subjectId,
        type: tq.question.type,
        difficulty: tq.question.difficulty,
        questionText: tq.question.questionText,
        options: tq.question.options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          sortOrder: opt.sortOrder
        }))
      }
    }));

    return {
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        status: attempt.status,
        totalAllowedSeconds,
        remainingSeconds,
        savedAnswers: attempt.studentAnswers
      },
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        questions: sanitizedQuestions
      }
    };
  }

  /**
   * Save / auto-save answer for a question in active attempt (Student)
   */
  static async saveAnswer(userId: string, testId: string, instituteId: string, input: SaveAnswerInput) {
    const { questionId, selectedOptionIds, textAnswer, timeSpentSeconds = 0 } = input;

    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { testId_studentId: { testId, studentId: student.id } },
      include: { test: true }
    });

    if (!attempt) {
      throw new AppError("Test attempt not found. Please start the test first", HTTP_STATUS.NOT_FOUND);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new AppError("Test attempt has already been submitted", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify time limit (with 60s grace period for network latency)
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
    const maxAllowedSeconds = attempt.test.durationMinutes * 60 + 60;

    if (elapsedSeconds > maxAllowedSeconds) {
      // Auto-submit expired attempt
      await EvaluationService.evaluateAttempt(attempt.id);
      throw new AppError("Time limit exceeded. Your test has been auto-submitted", HTTP_STATUS.BAD_REQUEST);
    }

    const savedAnswer = await prisma.studentAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId
        }
      },
      update: {
        selectedOptionIds: selectedOptionIds ? (selectedOptionIds as any) : undefined,
        textAnswer: textAnswer !== undefined ? textAnswer : undefined,
        timeSpentSeconds
      },
      create: {
        attemptId: attempt.id,
        questionId,
        selectedOptionIds: selectedOptionIds ? (selectedOptionIds as any) : undefined,
        textAnswer: textAnswer || null,
        timeSpentSeconds
      }
    });

    return savedAnswer;
  }

  /**
   * Final submit test attempt and trigger evaluation (Student)
   */
  static async submitAttempt(userId: string, testId: string, instituteId: string) {
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { testId_studentId: { testId, studentId: student.id } }
    });

    if (!attempt) {
      throw new AppError("Test attempt not found", HTTP_STATUS.NOT_FOUND);
    }

    if (attempt.status === AttemptStatus.EVALUATED) {
      return EvaluationService.getAttemptResult(attempt.id);
    }

    // Evaluate attempt atomically
    const evaluatedResult = await EvaluationService.evaluateAttempt(attempt.id);
    return evaluatedResult;
  }
}
