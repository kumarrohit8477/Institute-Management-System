import { z } from "zod";
import { QuestionType, DifficultyLevel } from "@prisma/client";

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  optionText: z.string({ required_error: "Option text is required" }).min(1),
  isCorrect: z.boolean().default(false),
  sortOrder: z.number().int().default(0)
});

export const createQuestionSchema = z.object({
  body: z.object({
    subjectId: z.string({ required_error: "Subject ID is required" }),
    type: z.nativeEnum(QuestionType).default(QuestionType.SINGLE_CHOICE),
    difficulty: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.MEDIUM),
    questionText: z.string({ required_error: "Question text is required" }).min(2),
    explanation: z.string().optional().nullable(),
    defaultMarks: z.coerce.number().positive().default(4.0),
    defaultNegativeMarks: z.coerce.number().min(0).default(1.0),
    numericalAnswer: z.string().optional().nullable(),
    options: z.array(questionOptionSchema).optional().default([])
  })
});

export const updateQuestionSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Question ID is required" })
  }),
  body: z.object({
    subjectId: z.string().optional(),
    type: z.nativeEnum(QuestionType).optional(),
    difficulty: z.nativeEnum(DifficultyLevel).optional(),
    questionText: z.string().min(2).optional(),
    explanation: z.string().optional().nullable(),
    defaultMarks: z.coerce.number().positive().optional(),
    defaultNegativeMarks: z.coerce.number().min(0).optional(),
    numericalAnswer: z.string().optional().nullable(),
    options: z.array(questionOptionSchema).optional()
  })
});

export const questionQuerySchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    type: z.nativeEnum(QuestionType).optional(),
    difficulty: z.nativeEnum(DifficultyLevel).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>["body"];
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>["body"];
export type QuestionQueryParams = z.infer<typeof questionQuerySchema>["query"];
