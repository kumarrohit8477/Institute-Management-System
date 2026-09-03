import { z } from "zod";

export const addCourseSubjectSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: "Course ID is required" })
  }),
  body: z.object({
    subjectId: z.string({ required_error: "Subject ID is required" }),
    displayOrder: z.coerce.number().min(0).optional().default(0),
    estimatedDuration: z.string().optional().nullable()
  })
});

export const updateCourseSubjectSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: "Course ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" })
  }),
  body: z.object({
    displayOrder: z.coerce.number().min(0).optional(),
    estimatedDuration: z.string().optional().nullable()
  })
});

export const deleteCourseSubjectSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: "Course ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" })
  })
});

export type AddCourseSubjectInput = z.infer<typeof addCourseSubjectSchema>["body"];
export type UpdateCourseSubjectInput = z.infer<typeof updateCourseSubjectSchema>["body"];
