import { z } from "zod";
import { FeeStatus } from "@prisma/client";

export const createFeeSchema = z.object({
  body: z.object({
    studentId: z.string({ required_error: "Student ID is required" }),
    batchId: z.string().optional().nullable(),
    title: z.string({ required_error: "Fee title is required" }).min(2),
    totalAmount: z.coerce.number().positive("Total amount must be greater than 0"),
    discountAmount: z.coerce.number().min(0).default(0),
    dueDate: z
      .string({ required_error: "Due date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
    status: z.nativeEnum(FeeStatus).default(FeeStatus.PENDING)
  })
});

export const updateFeeSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Fee ID is required" })
  }),
  body: z.object({
    batchId: z.string().optional().nullable(),
    title: z.string().min(2).optional(),
    totalAmount: z.coerce.number().positive().optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    status: z.nativeEnum(FeeStatus).optional()
  })
});

export const feeQuerySchema = z.object({
  query: z.object({
    studentId: z.string().optional(),
    batchId: z.string().optional(),
    status: z.nativeEnum(FeeStatus).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateFeeInput = z.infer<typeof createFeeSchema>["body"];
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>["body"];
export type FeeQueryParams = z.infer<typeof feeQuerySchema>["query"];
