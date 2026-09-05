import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { Prisma } from "@prisma/client";
import { CreateQuestionInput, UpdateQuestionInput, QuestionQueryParams } from "../validations/question.validation";

export class QuestionService {
  /**
   * Create question with options in Question Bank (Admin)
   */
  static async createQuestion(instituteId: string, input: CreateQuestionInput) {
    const {
      subjectId,
      type,
      difficulty,
      questionText,
      explanation,
      defaultMarks = 4.0,
      defaultNegativeMarks = 1.0,
      numericalAnswer,
      options = []
    } = input;

    // Verify subject belongs to institute
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId }
    });

    if (!subject) {
      throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const question = await prisma.$transaction(async (tx) => {
      const created = await tx.question.create({
        data: {
          instituteId,
          subjectId,
          type,
          difficulty,
          questionText,
          explanation: explanation || null,
          defaultMarks,
          defaultNegativeMarks,
          numericalAnswer: numericalAnswer || null
        }
      });

      if (options.length > 0) {
        await tx.questionOption.createMany({
          data: options.map((opt, idx) => ({
            questionId: created.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : idx + 1
          }))
        });
      }

      return tx.question.findUnique({
        where: { id: created.id },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          options: { orderBy: { sortOrder: "asc" } }
        }
      });
    });

    return question;
  }

  /**
   * Query Question Bank with pagination and filters (Admin)
   */
  static async getQuestions(instituteId: string, params: QuestionQueryParams) {
    const { subjectId, type, difficulty, search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {
      instituteId,
      ...(subjectId ? { subjectId } : {}),
      ...(type ? { type } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(search
        ? {
            OR: [
              { questionText: { contains: search } },
              { explanation: { contains: search } }
            ]
          }
        : {})
    };

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          options: { orderBy: { sortOrder: "asc" } }
        }
      })
    ]);

    return {
      questions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single question by ID with options
   */
  static async getQuestionById(instituteId: string, id: string) {
    const question = await prisma.question.findFirst({
      where: { id, instituteId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        options: { orderBy: { sortOrder: "asc" } }
      }
    });

    if (!question) {
      throw new AppError("Question not found", HTTP_STATUS.NOT_FOUND);
    }

    return question;
  }

  /**
   * Update question and sync options
   */
  static async updateQuestion(instituteId: string, id: string, input: UpdateQuestionInput) {
    const existing = await prisma.question.findFirst({
      where: { id, instituteId }
    });

    if (!existing) {
      throw new AppError("Question not found", HTTP_STATUS.NOT_FOUND);
    }

    const {
      subjectId,
      type,
      difficulty,
      questionText,
      explanation,
      defaultMarks,
      defaultNegativeMarks,
      numericalAnswer,
      options
    } = input;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          ...(subjectId ? { subjectId } : {}),
          ...(type ? { type } : {}),
          ...(difficulty ? { difficulty } : {}),
          ...(questionText ? { questionText } : {}),
          ...(explanation !== undefined ? { explanation } : {}),
          ...(defaultMarks !== undefined ? { defaultMarks } : {}),
          ...(defaultNegativeMarks !== undefined ? { defaultNegativeMarks } : {}),
          ...(numericalAnswer !== undefined ? { numericalAnswer } : {})
        }
      });

      if (options && options.length > 0) {
        // Delete old options and insert new
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        await tx.questionOption.createMany({
          data: options.map((opt, idx) => ({
            questionId: id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : idx + 1
          }))
        });
      }

      return tx.question.findUnique({
        where: { id },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          options: { orderBy: { sortOrder: "asc" } }
        }
      });
    });

    return updated;
  }

  /**
   * Delete question
   */
  static async deleteQuestion(instituteId: string, id: string) {
    const existing = await prisma.question.findFirst({
      where: { id, instituteId }
    });

    if (!existing) {
      throw new AppError("Question not found", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.question.delete({ where: { id } });
    return { deleted: true, id };
  }
}
