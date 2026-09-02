import { z } from "zod";
import { SubjectStatus } from "@prisma/client";

export const createSubjectSchema = z.object({
  body: z.object({
    courseId: z.string({ required_error: "Course ID is required" }),
    name: z.string({ required_error: "Subject name is required" }).min(2),
    code: z.string({ required_error: "Subject code is required" }).min(2).toUpperCase(),
    description: z.string().optional().nullable()
  })
});

export const updateSubjectSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Subject ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    description: z.string().optional().nullable(),
    status: z.nativeEnum(SubjectStatus).optional()
  })
});

export const subjectQuerySchema = z.object({
  query: z.object({
    courseId: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(SubjectStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>["body"];
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>["body"];
