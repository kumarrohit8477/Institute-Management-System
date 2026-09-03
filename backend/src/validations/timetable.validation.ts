import { z } from "zod";
import { DayOfWeek, ScheduleStatus, ClassType } from "@prisma/client";

export const createTimetableSchema = z.object({
  body: z.object({
    batchId: z.string({ required_error: "Batch ID is required" }),
    subjectId: z.string({ required_error: "Subject ID is required" }),
    teacherId: z.string({ required_error: "Teacher ID is required" }),
    roomId: z.string().optional().nullable(),
    batchSubjectId: z.string().optional().nullable(),
    dayOfWeek: z.nativeEnum(DayOfWeek, { required_error: "Day of week is required" }),
    startTime: z.string({ required_error: "Start time is required" }),
    endTime: z.string({ required_error: "End time is required" }),
    roomNumber: z.string().optional().nullable(),
    meetingLink: z.string().optional().nullable(),
    classType: z.nativeEnum(ClassType).default(ClassType.OFFLINE),
    status: z.nativeEnum(ScheduleStatus).default(ScheduleStatus.ACTIVE)
  })
});

export const updateTimetableSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Timetable ID is required" })
  }),
  body: z.object({
    batchId: z.string().optional(),
    subjectId: z.string().optional(),
    teacherId: z.string().optional(),
    roomId: z.string().optional().nullable(),
    batchSubjectId: z.string().optional().nullable(),
    dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    roomNumber: z.string().optional().nullable(),
    meetingLink: z.string().optional().nullable(),
    classType: z.nativeEnum(ClassType).optional(),
    status: z.nativeEnum(ScheduleStatus).optional()
  })
});

export const timetableQuerySchema = z.object({
  query: z.object({
    batchId: z.string().optional(),
    teacherId: z.string().optional(),
    roomId: z.string().optional(),
    dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
    status: z.nativeEnum(ScheduleStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>["body"];
export type UpdateTimetableInput = z.infer<typeof updateTimetableSchema>["body"];
export type TimetableQueryParams = z.infer<typeof timetableQuerySchema>["query"];
