import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { Prisma, TestStatus, UserRole } from "@prisma/client";
import {
  CreateTestInput,
  UpdateTestInput,
  AddQuestionsToTestInput,
  TestQueryParams
} from "../validations/test.validation";

export class TestService {
  /**
   * Create an online exam / test blueprint (Admin)
   */
  static async createTest(instituteId: string, input: CreateTestInput) {
    const {
      batchId,
      subjectId,
      title,
      description,
      durationMinutes = 180,
      totalMarks = 300.0,
      passingMarks = 100.0,
      startTime,
      endTime,
      isPublished = false,
      status = TestStatus.DRAFT,
      questions = []
    } = input;

    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError("Test start time must be before end time", HTTP_STATUS.BAD_REQUEST);
    }

    if (batchId) {
      const batch = await prisma.batch.findFirst({ where: { id: batchId, instituteId } });
      if (!batch) throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    if (subjectId) {
      const subject = await prisma.subject.findFirst({ where: { id: subjectId, instituteId } });
      if (!subject) throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const test = await prisma.$transaction(async (tx) => {
      const created = await tx.test.create({
        data: {
          instituteId,
          batchId: batchId || null,
          subjectId: subjectId || null,
          title,
          description: description || null,
          durationMinutes,
          totalMarks,
          passingMarks,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isPublished,
          status
        }
      });

      if (questions.length > 0) {
        await tx.testQuestion.createMany({
          data: questions.map((q, idx) => ({
            testId: created.id,
            questionId: q.questionId,
            sectionName: q.sectionName || null,
            sortOrder: q.sortOrder !== undefined ? q.sortOrder : idx + 1,
            marks: q.marks,
            negativeMarks: q.negativeMarks
          }))
        });
      }

      return tx.test.findUnique({
        where: { id: created.id },
        include: {
          batch: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          testQuestions: {
            include: {
              question: {
                include: { options: { orderBy: { sortOrder: "asc" } } }
              }
            },
            orderBy: { sortOrder: "asc" }
          }
        }
      });
    });

    return test;
  }

  /**
   * List tests with role-aware scoping
   */
  static async getTests(
    instituteId: string,
    params: TestQueryParams,
    userRole: UserRole,
    userId?: string
  ) {
    const { batchId, subjectId, status, isPublished, search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    let studentBatchIds: string[] = [];
    let studentId: string | null = null;

    if (userRole === UserRole.STUDENT && userId) {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: { batches: { where: { status: "ACTIVE" } } }
      });
      if (student) {
        studentId = student.id;
        studentBatchIds = student.batches.map((b) => b.batchId);
      }
    }

    const where: Prisma.TestWhereInput = {
      instituteId,
      ...(userRole === UserRole.STUDENT
        ? {
            isPublished: true,
            OR: [
              { batchId: null },
              { batchId: { in: studentBatchIds } }
            ]
          }
        : {
            ...(batchId ? { batchId } : {}),
            ...(isPublished ? { isPublished: isPublished === "true" } : {})
          }),
      ...(subjectId ? { subjectId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };

    const [total, tests] = await Promise.all([
      prisma.test.count({ where }),
      prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
        include: {
          batch: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true, code: true } },
          _count: { select: { testQuestions: true, testAttempts: true } },
          ...(studentId
            ? {
                testAttempts: {
                  where: { studentId },
                  select: { id: true, status: true, score: true, startedAt: true, submittedAt: true }
                }
              }
            : {})
        }
      })
    ]);

    // Format response
    const formatted = tests.map((t: any) => {
      const attempt = t.testAttempts?.[0] || null;
      return {
        ...t,
        testAttempts: undefined,
        myAttempt: attempt
      };
    });

    return {
      tests: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single test details (Masks answers for students)
   */
  static async getTestById(
    instituteId: string,
    id: string,
    userRole: UserRole,
    userId?: string
  ) {
    const test = await prisma.test.findFirst({
      where: { id, instituteId },
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
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

    // If Student, verify eligibility and check if submitted
    if (userRole === UserRole.STUDENT && userId) {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: { batches: { where: { status: "ACTIVE" } } }
      });

      if (!student) {
        throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
      }

      const attempt = await prisma.testAttempt.findUnique({
        where: { testId_studentId: { testId: id, studentId: student.id } },
        include: { result: true }
      });

      const isEvaluated = attempt?.status === "EVALUATED" || attempt?.status === "SUBMITTED";

      // If NOT yet submitted/evaluated, sanitize question answers
      if (!isEvaluated) {
        const sanitizedQuestions = test.testQuestions.map((tq) => ({
          ...tq,
          question: {
            id: tq.question.id,
            subjectId: tq.question.subjectId,
            type: tq.question.type,
            difficulty: tq.question.difficulty,
            questionText: tq.question.questionText,
            explanation: null, // MASKED
            numericalAnswer: null, // MASKED
            defaultMarks: tq.question.defaultMarks,
            defaultNegativeMarks: tq.question.defaultNegativeMarks,
            options: tq.question.options.map((opt) => ({
              id: opt.id,
              optionText: opt.optionText,
              sortOrder: opt.sortOrder,
              isCorrect: false // MASKED
            }))
          }
        }));

        return {
          ...test,
          testQuestions: sanitizedQuestions,
          myAttempt: attempt
        };
      }

      return {
        ...test,
        myAttempt: attempt
      };
    }

    return test;
  }

  /**
   * Update test metadata & schedule (Admin)
   */
  static async updateTest(instituteId: string, id: string, input: UpdateTestInput) {
    const existing = await prisma.test.findFirst({ where: { id, instituteId } });
    if (!existing) throw new AppError("Test not found", HTTP_STATUS.NOT_FOUND);

    const updated = await prisma.test.update({
      where: { id },
      data: {
        ...(input.batchId !== undefined ? { batchId: input.batchId } : {}),
        ...(input.subjectId !== undefined ? { subjectId: input.subjectId } : {}),
        ...(input.title ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.durationMinutes ? { durationMinutes: input.durationMinutes } : {}),
        ...(input.totalMarks ? { totalMarks: input.totalMarks } : {}),
        ...(input.passingMarks ? { passingMarks: input.passingMarks } : {}),
        ...(input.startTime ? { startTime: new Date(input.startTime) } : {}),
        ...(input.endTime ? { endTime: new Date(input.endTime) } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
        ...(input.status ? { status: input.status } : {})
      },
      include: {
        batch: true,
        subject: true
      }
    });

    return updated;
  }

  /**
   * Add questions to test (Admin)
   */
  static async addQuestionsToTest(instituteId: string, id: string, input: AddQuestionsToTestInput) {
    const test = await prisma.test.findFirst({ where: { id, instituteId } });
    if (!test) throw new AppError("Test not found", HTTP_STATUS.NOT_FOUND);

    const results = await prisma.$transaction(
      input.questions.map((q) =>
        prisma.testQuestion.upsert({
          where: { testId_questionId: { testId: id, questionId: q.questionId } },
          update: {
            sectionName: q.sectionName || null,
            sortOrder: q.sortOrder,
            marks: q.marks,
            negativeMarks: q.negativeMarks
          },
          create: {
            testId: id,
            questionId: q.questionId,
            sectionName: q.sectionName || null,
            sortOrder: q.sortOrder,
            marks: q.marks,
            negativeMarks: q.negativeMarks
          }
        })
      )
    );

    return { addedCount: results.length, questions: results };
  }

  /**
   * Remove question from test (Admin)
   */
  static async removeQuestionFromTest(instituteId: string, testId: string, questionId: string) {
    const test = await prisma.test.findFirst({ where: { id: testId, instituteId } });
    if (!test) throw new AppError("Test not found", HTTP_STATUS.NOT_FOUND);

    await prisma.testQuestion.delete({
      where: { testId_questionId: { testId, questionId } }
    });

    return { deleted: true, testId, questionId };
  }

  /**
   * Delete test (Admin)
   */
  static async deleteTest(instituteId: string, id: string) {
    const test = await prisma.test.findFirst({ where: { id, instituteId } });
    if (!test) throw new AppError("Test not found", HTTP_STATUS.NOT_FOUND);

    await prisma.test.delete({ where: { id } });
    return { deleted: true, id };
  }
}
