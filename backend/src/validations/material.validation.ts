import { z } from "zod";
import { MaterialType } from "@prisma/client";

export const createMaterialSchema = z.object({
  body: z.object({
    courseId: z.string({ required_error: "Course ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" }),
    batchId: z.string().optional().nullable(), // Optional scoping to batch
    title: z.string({ required_error: "Title is required" }).min(2),
    description: z.string().optional().nullable(),
    fileUrl: z.string({ required_error: "File or Link URL is required" }).url(),
    fileType: z.nativeEnum(MaterialType).default(MaterialType.PDF),
    fileSizeBytes: z.coerce.number().optional().nullable()
  })
});

export const updateMaterialSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Material ID is required" })
  }),
  body: z.object({
    courseId: z.string().optional(),
    subjectId: z.string().optional(),
    batchId: z.string().optional().nullable(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    fileUrl: z.string().url().optional(),
    fileType: z.nativeEnum(MaterialType).optional()
  })
});

export const materialQuerySchema = z.object({
  query: z.object({
    courseId: z.string().optional(),
    subjectId: z.string().optional(),
    batchId: z.string().optional(),
    fileType: z.nativeEnum(MaterialType).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>["body"];
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>["body"];
export type MaterialQueryParams = z.infer<typeof materialQuerySchema>["query"];
