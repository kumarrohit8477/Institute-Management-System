import { z } from "zod";
import { TestStatus } from "@prisma/client";

export const addTestQuestionItemSchema = z.object({
  questionId: z.string({ required_error: "Question ID is required" }),
  sectionName: z.string().optional().nullable(),
  sortOrder: z.number().int().default(1),
  marks: z.coerce.number().positive().default(4.0),
  negativeMarks: z.coerce.number().min(0).default(1.0)
});

export const createTestSchema = z.object({
  body: z.object({
    batchId: z.string().optional().nullable(),
    subjectId: z.string().optional().nullable(),
    title: z.string({ required_error: "Test title is required" }).min(2),
    description: z.string().optional().nullable(),
    durationMinutes: z.coerce.number().int().positive().default(180),
    totalMarks: z.coerce.number().positive().default(300.0),
    passingMarks: z.coerce.number().positive().default(100.0),
    startTime: z.string({ required_error: "Start time is required" }),
    endTime: z.string({ required_error: "End time is required" }),
    isPublished: z.boolean().default(false),
    status: z.nativeEnum(TestStatus).default(TestStatus.DRAFT),
    questions: z.array(addTestQuestionItemSchema).optional().default([])
  })
});

export const updateTestSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Test ID is required" })
  }),
  body: z.object({
    batchId: z.string().optional().nullable(),
    subjectId: z.string().optional().nullable(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    durationMinutes: z.coerce.number().int().positive().optional(),
    totalMarks: z.coerce.number().positive().optional(),
    passingMarks: z.coerce.number().positive().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isPublished: z.boolean().optional(),
    status: z.nativeEnum(TestStatus).optional()
  })
});

export const addQuestionsToTestSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Test ID is required" })
  }),
  body: z.object({
    questions: z.array(addTestQuestionItemSchema).min(1, "At least one question is required")
  })
});

export const testQuerySchema = z.object({
  query: z.object({
    batchId: z.string().optional(),
    subjectId: z.string().optional(),
    status: z.nativeEnum(TestStatus).optional(),
    isPublished: z.enum(["true", "false"]).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateTestInput = z.infer<typeof createTestSchema>["body"];
export type UpdateTestInput = z.infer<typeof updateTestSchema>["body"];
export type AddQuestionsToTestInput = z.infer<typeof addQuestionsToTestSchema>["body"];
export type TestQueryParams = z.infer<typeof testQuerySchema>["query"];
