import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { QuestionType, AttemptStatus } from "@prisma/client";

export class EvaluationService {
  /**
   * Automatically evaluate a student's test attempt and generate published results
   */
  static async evaluateAttempt(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: true,
        studentAnswers: true,
        test: {
          include: {
            institute: true,
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: true
                  }
                }
              },
              orderBy: { sortOrder: "asc" }
            }
          }
        }
      }
    });

    if (!attempt) {
      throw new AppError("Test attempt not found", HTTP_STATUS.NOT_FOUND);
    }

    const { test, studentAnswers } = attempt;
    const answerMap = new Map<string, any>();
    for (const ans of studentAnswers) {
      answerMap.set(ans.questionId, ans);
    }

    let totalScore = 0;
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    const answerUpdates: Array<{
      id: string;
      isCorrect: boolean;
      marksAwarded: number;
    }> = [];

    const newAnswersToCreate: Array<{
      attemptId: string;
      questionId: string;
      isCorrect: boolean;
      marksAwarded: number;
    }> = [];

    for (const tq of test.testQuestions) {
      const q = tq.question;
      const studentAns = answerMap.get(q.id);
      const marks = Number(tq.marks);
      const negativeMarks = Number(tq.negativeMarks);

      let isAttempted = false;
      let isCorrect = false;

      if (studentAns) {
        const selectedIds: string[] = (studentAns.selectedOptionIds as string[]) || [];
        const textAnswer: string = studentAns.textAnswer || "";

        if (selectedIds.length > 0 || textAnswer.trim().length > 0) {
          isAttempted = true;
          totalAttempted++;

          if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.TRUE_FALSE) {
            const correctOpt = q.options.find((o) => o.isCorrect);
            if (correctOpt && selectedIds.length === 1 && selectedIds[0] === correctOpt.id) {
              isCorrect = true;
            }
          } else if (q.type === QuestionType.MULTIPLE_CHOICE) {
            const correctOptIds = new Set(q.options.filter((o) => o.isCorrect).map((o) => o.id));
            const selectedSet = new Set(selectedIds);

            if (
              correctOptIds.size === selectedSet.size &&
              [...correctOptIds].every((id) => selectedSet.has(id))
            ) {
              isCorrect = true;
            }
          } else if (q.type === QuestionType.NUMERICAL) {
            if (q.numericalAnswer && textAnswer) {
              const expected = parseFloat(q.numericalAnswer.trim());
              const actual = parseFloat(textAnswer.trim());
              if (!isNaN(expected) && !isNaN(actual)) {
                isCorrect = Math.abs(expected - actual) < 0.001;
              } else {
                isCorrect = q.numericalAnswer.trim().toLowerCase() === textAnswer.trim().toLowerCase();
              }
            }
          } else if (q.type === QuestionType.SUBJECTIVE) {
            // Default 0 for manual review
            isCorrect = false;
          }
        }
      }

      let marksAwarded = 0;
      if (isAttempted) {
        if (isCorrect) {
          marksAwarded = marks;
          totalCorrect++;
        } else {
          marksAwarded = -negativeMarks;
          totalIncorrect++;
        }
      }

      totalScore += marksAwarded;

      if (studentAns) {
        answerUpdates.push({
          id: studentAns.id,
          isCorrect,
          marksAwarded
        });
      }
    }

    const testTotalMarks = Number(test.totalMarks);
    const passingMarks = Number(test.passingMarks);
    const percentage = testTotalMarks > 0 ? (totalScore / testTotalMarks) * 100 : 0;
    const isPassed = totalScore >= passingMarks;

    // Apply updates in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Student Answers
      for (const upd of answerUpdates) {
        await tx.studentAnswer.update({
          where: { id: upd.id },
          data: {
            isCorrect: upd.isCorrect,
            marksAwarded: upd.marksAwarded
          }
        });
      }

      // 2. Update Test Attempt
      await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          score: totalScore,
          totalAttempted,
          totalCorrect,
          totalIncorrect,
          status: AttemptStatus.EVALUATED,
          submittedAt: attempt.submittedAt || new Date()
        }
      });

      // 3. Upsert Result
      await tx.result.upsert({
        where: { attemptId },
        update: {
          totalMarksObtained: totalScore,
          percentage,
          isPassed,
          remarks: isPassed ? "Qualified successfully" : "Needs improvement"
        },
        create: {
          instituteId: test.instituteId,
          testId: test.id,
          studentId: attempt.studentId,
          attemptId,
          totalMarksObtained: totalScore,
          percentage,
          isPassed,
          remarks: isPassed ? "Qualified successfully" : "Needs improvement"
        }
      });
    });

    // 4. Recalculate Ranks & Percentiles for this test
    await EvaluationService.recalculateRanks(test.id);

    return EvaluationService.getAttemptResult(attemptId);
  }

  /**
   * Recalculate ranks and percentiles for all students in a test
   */
  static async recalculateRanks(testId: string) {
    const results = await prisma.result.findMany({
      where: { testId },
      orderBy: [{ totalMarksObtained: "desc" }, { createdAt: "asc" }]
    });

    const totalStudents = results.length;
    if (totalStudents === 0) return;

    for (let i = 0; i < totalStudents; i++) {
      const rank = i + 1;
      const belowCount = totalStudents - (i + 1);
      const percentile = totalStudents > 1 ? (belowCount / (totalStudents - 1)) * 100 : 100.0;

      await prisma.result.update({
        where: { id: results[i].id },
        data: {
          rank,
          percentile: Math.round(percentile * 100) / 100
        }
      });
    }
  }

  /**
   * Get detailed result for an evaluated attempt
   */
  static async getAttemptResult(attemptId: string) {
    const result = await prisma.result.findUnique({
      where: { attemptId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        test: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            totalMarks: true,
            passingMarks: true,
            startTime: true,
            endTime: true
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
      throw new AppError("Result not found", HTTP_STATUS.NOT_FOUND);
    }

    return result;
  }
}
