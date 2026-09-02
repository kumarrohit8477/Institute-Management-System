import { z } from "zod";
import { CourseStatus } from "@prisma/client";

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Course name is required" }).min(2),
    code: z.string({ required_error: "Course code is required" }).min(2).toUpperCase(),
    description: z.string().optional().nullable(),
    durationMonths: z.coerce.number().min(1).optional().nullable()
  })
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Course ID is required" })
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).toUpperCase().optional(),
    description: z.string().optional().nullable(),
    durationMonths: z.coerce.number().min(1).optional().nullable(),
    status: z.nativeEnum(CourseStatus).optional()
  })
});

export const courseQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>["body"];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>["body"];
