import { z } from "zod";
import { StudentStatus, Gender } from "@prisma/client";

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: "First name is required" }).min(2),
    lastName: z.string({ required_error: "Last name is required" }).min(1),
    email: z.string({ required_error: "Email is required" }).email(),
    password: z.string().min(6).optional(), // Auto-generated if not provided
    admissionNumber: z.string().optional(), // Auto-generated if not provided
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    address: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    guardianName: z.string().optional().nullable(),
    guardianPhone: z.string().optional().nullable(),
    guardianEmail: z.string().email().optional().nullable(),
    batchId: z.string().uuid().optional(), // Optional immediate batch enrollment
    rollNumber: z.string().optional()
  })
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Student ID is required" })
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    address: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    guardianName: z.string().optional().nullable(),
    guardianPhone: z.string().optional().nullable(),
    guardianEmail: z.string().email().optional().nullable(),
    status: z.nativeEnum(StudentStatus).optional()
  })
});

export const studentQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
    gender: z.nativeEnum(Gender).optional(),
    batchId: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  })
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>["body"];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>["body"];
export type StudentQueryParams = z.infer<typeof studentQuerySchema>["query"];
