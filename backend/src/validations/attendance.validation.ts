import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

export const bulkAttendanceItemSchema = z.object({
  studentId: z.string({ required_error: "Student ID is required" }),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
  remarks: z.string().optional().nullable()
});

export const bulkAttendanceSchema = z.object({
  body: z.object({
    batchId: z.string({ required_error: "Batch ID is required" }),
    date: z
      .string({ required_error: "Attendance date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
    attendances: z
      .array(bulkAttendanceItemSchema, { required_error: "Attendances array is required" })
      .min(1, "At least one student attendance record is required")
  })
});

export const updateSingleAttendanceSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Attendance ID is required" })
  }),
  body: z.object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    remarks: z.string().optional().nullable()
  })
});

export const batchAttendanceQuerySchema = z.object({
  params: z.object({
    batchId: z.string({ required_error: "Batch ID is required" })
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD").optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(200).default(100)
  })
});

export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>["body"];
export type UpdateSingleAttendanceInput = z.infer<typeof updateSingleAttendanceSchema>["body"];
