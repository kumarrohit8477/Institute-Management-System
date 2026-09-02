import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { ScheduleStatus, Prisma, DayOfWeek } from "@prisma/client";
import { CreateTimetableInput, UpdateTimetableInput, TimetableQueryParams } from "../validations/timetable.validation";

export class TimetableService {
  /**
   * Create a new class schedule slot (Admin)
   */
  static async createTimetable(instituteId: string, input: CreateTimetableInput) {
    const {
      batchId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      roomNumber,
      meetingLink,
      classType,
      status = ScheduleStatus.ACTIVE
    } = input;

    // 1. Verify entities exist in this institute
    const batch = await prisma.batch.findFirst({ where: { id: batchId, instituteId } });
    if (!batch) throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);

    const subject = await prisma.subject.findFirst({ where: { id: subjectId, instituteId } });
    if (!subject) throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);

    const teacher = await prisma.teacher.findFirst({ where: { id: teacherId, instituteId } });
    if (!teacher) throw new AppError("Teacher not found in this institute", HTTP_STATUS.NOT_FOUND);

    // 2. Conflict check: Teacher clash on same day & overlapping time
    const teacherClash = await prisma.timetable.findFirst({
      where: {
        instituteId,
        teacherId,
        dayOfWeek,
        status: ScheduleStatus.ACTIVE,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }]
      },
      include: { batch: true, subject: true }
    });

    if (teacherClash) {
      throw new AppError(
        `Teacher schedule clash: ${teacher.firstName} ${teacher.lastName} is already assigned to ${teacherClash.batch.name} (${teacherClash.subject.name}) at this time`,
        HTTP_STATUS.CONFLICT
      );
    }

    // 3. Conflict check: Batch clash on same day & overlapping time
    const batchClash = await prisma.timetable.findFirst({
      where: {
        instituteId,
        batchId,
        dayOfWeek,
        status: ScheduleStatus.ACTIVE,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }]
      },
      include: { subject: true, teacher: true }
    });

    if (batchClash) {
      throw new AppError(
        `Batch schedule clash: ${batch.name} already has ${batchClash.subject.name} scheduled with ${batchClash.teacher.firstName} at this time`,
        HTTP_STATUS.CONFLICT
      );
    }

    const timetable = await prisma.timetable.create({
      data: {
        instituteId,
        batchId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
        meetingLink,
        classType,
        status
      },
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } }
      }
    });

    return timetable;
  }

  /**
   * List timetables with filters (Admin)
   */
  static async getTimetables(instituteId: string, params: TimetableQueryParams) {
    const { batchId, teacherId, dayOfWeek, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TimetableWhereInput = {
      instituteId,
      ...(batchId ? { batchId } : {}),
      ...(teacherId ? { teacherId } : {}),
      ...(dayOfWeek ? { dayOfWeek } : {}),
      ...(status ? { status } : {})
    };

    const [total, slots] = await Promise.all([
      prisma.timetable.count({ where }),
      prisma.timetable.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: {
          batch: { select: { id: true, name: true, code: true, courseId: true } },
          subject: { select: { id: true, name: true, code: true } },
          teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true, phone: true } }
        }
      })
    ]);

    return {
      timetables: slots,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single timetable slot
   */
  static async getTimetableById(instituteId: string, id: string) {
    const slot = await prisma.timetable.findFirst({
      where: { id, instituteId },
      include: {
        batch: true,
        subject: true,
        teacher: true
      }
    });

    if (!slot) throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);
    return slot;
  }

  /**
   * Update timetable slot
   */
  static async updateTimetable(instituteId: string, id: string, input: UpdateTimetableInput) {
    const slot = await prisma.timetable.findFirst({
      where: { id, instituteId }
    });

    if (!slot) throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        ...(input.subjectId ? { subjectId: input.subjectId } : {}),
        ...(input.teacherId ? { teacherId: input.teacherId } : {}),
        ...(input.dayOfWeek ? { dayOfWeek: input.dayOfWeek } : {}),
        ...(input.startTime ? { startTime: input.startTime } : {}),
        ...(input.endTime ? { endTime: input.endTime } : {}),
        ...(input.roomNumber !== undefined ? { roomNumber: input.roomNumber } : {}),
        ...(input.meetingLink !== undefined ? { meetingLink: input.meetingLink } : {}),
        ...(input.classType ? { classType: input.classType } : {}),
        ...(input.status ? { status: input.status } : {})
      },
      include: {
        batch: true,
        subject: true,
        teacher: true
      }
    });

    return updated;
  }

  /**
   * Delete timetable slot
   */
  static async deleteTimetable(instituteId: string, id: string) {
    const slot = await prisma.timetable.findFirst({
      where: { id, instituteId }
    });

    if (!slot) throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);

    await prisma.timetable.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Student Schedule Scoping: Returns only schedule slots for student's active batches
   */
  static async getStudentSchedule(userId: string, instituteId: string) {
    // 1. Locate student
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        batches: {
          where: { status: "ACTIVE" },
          select: { batchId: true, batch: { select: { id: true, name: true, code: true } } }
        }
      }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const batchIds = student.batches.map((b) => b.batchId);
    if (batchIds.length === 0) {
      return {
        student: { id: student.id, name: `${student.firstName} ${student.lastName}` },
        enrolledBatches: [],
        scheduleByDay: {},
        allSlots: []
      };
    }

    // 2. Fetch all slots for student's batches
    const slots = await prisma.timetable.findMany({
      where: {
        instituteId,
        batchId: { in: batchIds },
        status: ScheduleStatus.ACTIVE
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    // 3. Group by Day of Week
    const daysOrder: DayOfWeek[] = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY
    ];

    const scheduleByDay: Record<string, any[]> = {};
    for (const day of daysOrder) {
      scheduleByDay[day] = slots.filter((s) => s.dayOfWeek === day);
    }

    return {
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        name: `${student.firstName} ${student.lastName}`
      },
      enrolledBatches: student.batches.map((b) => b.batch),
      scheduleByDay,
      allSlots: slots
    };
  }
}
