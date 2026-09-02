import { z } from "zod";
import { BatchStatus, StudentBatchStatus } from "@prisma/client";

export const createBatchSchema = z.object({
  body: z.object({
    courseId: z.string({ required_error: "Course ID is required" }),
    name: z.string({ required_error: "Batch name is required" }).min(2),
    code: z.string({ required_error: "Batch code is required" }).min(2).toUpperCase(),
    startDate: z.string({ required_error: "Start date is required" }),
    endDate: z.string().optional().nullable(),
    maxStrength: z.coerce.number().min(1).default(60),
    status: z.nativeEnum(BatchStatus).optional()
  })
});

export const updateBatchSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Batch ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional().nullable(),
    maxStrength: z.coerce.number().min(1).optional(),
    status: z.nativeEnum(BatchStatus).optional()
  })
});

export const assignStudentBatchSchema = z.object({
  params: z.object({
    batchId: z.string({ required_error: "Batch ID is required" })
  }),
  body: z.object({
    studentId: z.string({ required_error: "Student ID is required" }),
    rollNumber: z.string().optional(),
    enrolledAt: z.string().optional()
  })
});

export const updateStudentBatchSchema = z.object({
  params: z.object({
    batchId: z.string({ required_error: "Batch ID is required" }),
    studentId: z.string({ required_error: "Student ID is required" })
  }),
  body: z.object({
    rollNumber: z.string().optional(),
    status: z.nativeEnum(StudentBatchStatus).optional()
  })
});

export const batchQuerySchema = z.object({
  query: z.object({
    courseId: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(BatchStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>["body"];
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>["body"];
export type AssignStudentBatchInput = z.infer<typeof assignStudentBatchSchema>["body"];
