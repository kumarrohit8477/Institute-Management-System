import { z } from "zod";
import { BatchSubjectStatus } from "@prisma/client";

export const addBatchSubjectSchema = z.object({
  params: z.object({
    batchId: z.string({ required_error: "Batch ID is required" })
  }),
  body: z.object({
    subjectId: z.string({ required_error: "Subject ID is required" }),
    assignedTeacherId: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    expectedEndDate: z.string().optional().nullable(),
    status: z.nativeEnum(BatchSubjectStatus).optional().default(BatchSubjectStatus.NOT_STARTED),
    progress: z.coerce.number().min(0).max(100).optional().default(0),
    notes: z.string().optional().nullable()
  })
});

export const updateBatchSubjectSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Batch Subject ID is required" })
  }),
  body: z.object({
    assignedTeacherId: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    expectedEndDate: z.string().optional().nullable(),
    status: z.nativeEnum(BatchSubjectStatus).optional(),
    progress: z.coerce.number().min(0).max(100).optional(),
    notes: z.string().optional().nullable()
  })
});

export const assignBatchSubjectTeacherSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Batch Subject ID is required" })
  }),
  body: z.object({
    teacherId: z.string({ required_error: "Teacher ID is required" })
  })
});

export type AddBatchSubjectInput = z.infer<typeof addBatchSubjectSchema>["body"];
export type UpdateBatchSubjectInput = z.infer<typeof updateBatchSubjectSchema>["body"];
export type AssignBatchSubjectTeacherInput = z.infer<typeof assignBatchSubjectTeacherSchema>["body"];
