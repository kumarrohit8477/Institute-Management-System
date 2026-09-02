import { z } from "zod";
import { TeacherStatus, Gender } from "@prisma/client";

export const createTeacherSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: "First name is required" }).min(2),
    lastName: z.string({ required_error: "Last name is required" }).min(1),
    email: z.string({ required_error: "Email is required" }).email(),
    phone: z.string({ required_error: "Phone number is required" }).min(5),
    employeeCode: z.string().optional(), // Auto-generated if not provided
    gender: z.nativeEnum(Gender).optional().nullable(),
    qualification: z.string().optional().nullable(),
    specialization: z.string().optional().nullable(),
    experienceYears: z.coerce.number().min(0).default(0),
    avatarUrl: z.string().url().optional().nullable(),
    bio: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    joiningDate: z.string().optional(),
    subjectIds: z.array(z.string()).optional() // Array of subjects qualified for
  })
});

export const updateTeacherSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Teacher ID is required" })
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    gender: z.nativeEnum(Gender).optional().nullable(),
    qualification: z.string().optional().nullable(),
    specialization: z.string().optional().nullable(),
    experienceYears: z.coerce.number().min(0).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    bio: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.nativeEnum(TeacherStatus).optional()
  })
});

export const teacherQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(TeacherStatus).optional(),
    specialization: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
  })
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>["body"];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>["body"];
export type TeacherQueryParams = z.infer<typeof teacherQuerySchema>["query"];
