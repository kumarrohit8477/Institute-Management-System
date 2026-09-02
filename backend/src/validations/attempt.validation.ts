import { z } from "zod";

export const startAttemptSchema = z.object({
  params: z.object({
    testId: z.string({ required_error: "Test ID is required" })
  })
});

export const saveAnswerSchema = z.object({
  params: z.object({
    testId: z.string({ required_error: "Test ID is required" })
  }),
  body: z.object({
    questionId: z.string({ required_error: "Question ID is required" }),
    selectedOptionIds: z.array(z.string()).optional().nullable(),
    textAnswer: z.string().optional().nullable(),
    timeSpentSeconds: z.number().int().min(0).default(0)
  })
});

export const submitAttemptSchema = z.object({
  params: z.object({
    testId: z.string({ required_error: "Test ID is required" })
  })
});

export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>["body"];
