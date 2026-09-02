import { z } from "zod";
import { AssignmentStatus } from "@prisma/client";

export const assignTeacherSubjectSchema = z.object({
  params: z.object({
    teacherId: z.string({ required_error: "Teacher ID is required" })
  }),
  body: z.object({
    subjectId: z.string({ required_error: "Subject ID is required" })
  })
});

export const assignTeacherBatchSchema = z.object({
  body: z.object({
    teacherId: z.string({ required_error: "Teacher ID is required" }),
    courseId: z.string({ required_error: "Course ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" }),
    batchId: z.string({ required_error: "Batch ID is required" }),
    status: z.nativeEnum(AssignmentStatus).optional()
  })
});

export type AssignTeacherSubjectInput = z.infer<typeof assignTeacherSubjectSchema>["body"];
export type AssignTeacherBatchInput = z.infer<typeof assignTeacherBatchSchema>["body"];
