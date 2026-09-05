import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { ScheduleStatus, Prisma, DayOfWeek, ClassType } from "@prisma/client";
import { CreateTimetableInput, UpdateTimetableInput, TimetableQueryParams } from "../validations/timetable.validation";
import { TimeUtil } from "../utils/timeUtil";

export class TimetableService {
  /**
   * Reusable conflict detection for Teacher, Room, and Batch
   */
  static async checkScheduleConflict(
    instituteId: string,
    params: {
      batchId: string;
      teacherId: string;
      roomId?: string | null;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      excludeSlotId?: string;
    }
  ) {
    const { batchId, teacherId, roomId, dayOfWeek, startTime, endTime, excludeSlotId } = params;

    const normStart = TimeUtil.normalizeTime(startTime);
    const normEnd = TimeUtil.normalizeTime(endTime);

    if (TimeUtil.parseTimeToMinutes(normStart) >= TimeUtil.parseTimeToMinutes(normEnd)) {
      throw new AppError(`Class start time (${startTime}) must be before end time (${endTime})`, HTTP_STATUS.BAD_REQUEST);
    }

    // 1. Teacher Conflict: Check if teacher has overlapping class
    const teacherSlots = await prisma.timetable.findMany({
      where: {
        instituteId,
        teacherId,
        dayOfWeek,
        status: ScheduleStatus.ACTIVE,
        ...(excludeSlotId ? { id: { not: excludeSlotId } } : {})
      },
      include: { batch: true, subject: true, teacher: true }
    });

    for (const slot of teacherSlots) {
      if (TimeUtil.areIntervalsOverlapping(normStart, normEnd, slot.startTime, slot.endTime)) {
        throw new AppError(
          `Teacher conflict: Teacher ${slot.teacher.firstName} ${slot.teacher.lastName} is already assigned to another class during this time (${slot.batch.name} from ${slot.startTime} to ${slot.endTime} on ${dayOfWeek}).`,
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // 2. Room Conflict: Check if room is occupied
    if (roomId) {
      const roomSlots = await prisma.timetable.findMany({
        where: {
          instituteId,
          roomId,
          dayOfWeek,
          status: ScheduleStatus.ACTIVE,
          ...(excludeSlotId ? { id: { not: excludeSlotId } } : {})
        },
        include: { room: true, batch: true }
      });

      for (const slot of roomSlots) {
        if (TimeUtil.areIntervalsOverlapping(normStart, normEnd, slot.startTime, slot.endTime)) {
          const roomLabel = slot.room?.name || slot.room?.code || "The selected room";
          throw new AppError(
            `Room conflict: ${roomLabel} is already occupied during this time (by batch '${slot.batch.name}' from ${slot.startTime} to ${slot.endTime} on ${dayOfWeek}).`,
            HTTP_STATUS.CONFLICT
          );
        }
      }
    }

    // 3. Batch Conflict: Check if batch already has class at this time
    const batchSlots = await prisma.timetable.findMany({
      where: {
        instituteId,
        batchId,
        dayOfWeek,
        status: ScheduleStatus.ACTIVE,
        ...(excludeSlotId ? { id: { not: excludeSlotId } } : {})
      },
      include: { batch: true, subject: true, teacher: true }
    });

    for (const slot of batchSlots) {
      if (TimeUtil.areIntervalsOverlapping(normStart, normEnd, slot.startTime, slot.endTime)) {
        throw new AppError(
          `Batch conflict: A batch should not have two classes at the same time. ('${slot.batch.name}' already has ${slot.subject.name} from ${slot.startTime} to ${slot.endTime} on ${dayOfWeek}).`,
          HTTP_STATUS.CONFLICT
        );
      }
    }
  }

  /**
   * Create a new class schedule slot (Admin)
   */
  static async createTimetable(instituteId: string, input: CreateTimetableInput) {
    const {
      batchId,
      subjectId,
      teacherId,
      roomId,
      batchSubjectId,
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

    if (roomId) {
      const room = await prisma.room.findFirst({ where: { id: roomId, instituteId } });
      if (!room) throw new AppError("Room not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Perform reliable 3-way conflict check
    await this.checkScheduleConflict(instituteId, {
      batchId,
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime
    });

    const normStart = TimeUtil.normalizeTime(startTime);
    const normEnd = TimeUtil.normalizeTime(endTime);

    const timetable = await prisma.timetable.create({
      data: {
        instituteId,
        batchId,
        subjectId,
        teacherId,
        roomId: roomId || null,
        batchSubjectId: batchSubjectId || null,
        dayOfWeek,
        startTime: normStart,
        endTime: normEnd,
        roomNumber: roomNumber || null,
        meetingLink: meetingLink || null,
        classType,
        status
      },
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        room: { select: { id: true, name: true, code: true, capacity: true, type: true } }
      }
    });

    return timetable;
  }

  /**
   * List timetables with filters (Admin)
   */
  static async getTimetables(instituteId: string, params: TimetableQueryParams) {
    const { batchId, teacherId, roomId, dayOfWeek, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TimetableWhereInput = {
      instituteId,
      ...(batchId ? { batchId } : {}),
      ...(teacherId ? { teacherId } : {}),
      ...(roomId ? { roomId } : {}),
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
          teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true, phone: true } },
          room: { select: { id: true, name: true, code: true, capacity: true, type: true } }
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
        teacher: true,
        room: true
      }
    });

    if (!slot) throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);
    return slot;
  }

  /**
   * Update timetable slot with conflict check
   */
  static async updateTimetable(instituteId: string, id: string, input: UpdateTimetableInput) {
    const slot = await prisma.timetable.findFirst({
      where: { id, instituteId }
    });

    if (!slot) throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);

    const targetBatchId = input.batchId || slot.batchId;
    const targetTeacherId = input.teacherId || slot.teacherId;
    const targetRoomId = input.roomId !== undefined ? input.roomId : slot.roomId;
    const targetDay = input.dayOfWeek || slot.dayOfWeek;
    const targetStart = input.startTime ? TimeUtil.normalizeTime(input.startTime) : slot.startTime;
    const targetEnd = input.endTime ? TimeUtil.normalizeTime(input.endTime) : slot.endTime;

    // Check conflicts excluding the current slot
    await this.checkScheduleConflict(instituteId, {
      batchId: targetBatchId,
      teacherId: targetTeacherId,
      roomId: targetRoomId,
      dayOfWeek: targetDay,
      startTime: targetStart,
      endTime: targetEnd,
      excludeSlotId: id
    });

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        ...(input.batchId ? { batchId: input.batchId } : {}),
        ...(input.subjectId ? { subjectId: input.subjectId } : {}),
        ...(input.teacherId ? { teacherId: input.teacherId } : {}),
        ...(input.roomId !== undefined ? { roomId: input.roomId } : {}),
        ...(input.batchSubjectId !== undefined ? { batchSubjectId: input.batchSubjectId } : {}),
        ...(input.dayOfWeek ? { dayOfWeek: input.dayOfWeek } : {}),
        ...(input.startTime ? { startTime: targetStart } : {}),
        ...(input.endTime ? { endTime: targetEnd } : {}),
        ...(input.roomNumber !== undefined ? { roomNumber: input.roomNumber } : {}),
        ...(input.meetingLink !== undefined ? { meetingLink: input.meetingLink } : {}),
        ...(input.classType ? { classType: input.classType } : {}),
        ...(input.status ? { status: input.status } : {})
      },
      include: {
        batch: true,
        subject: true,
        teacher: true,
        room: true
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
   * Get all schedule slots for a batch (grouped by day)
   */
  static async getBatchSchedule(instituteId: string, batchId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });
    if (!batch) throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);

    const slots = await prisma.timetable.findMany({
      where: { batchId, instituteId, status: ScheduleStatus.ACTIVE },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        room: { select: { id: true, name: true, code: true, capacity: true, type: true } }
      }
    });

    const scheduleByDay: Record<string, any[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: []
    };

    for (const slot of slots) {
      if (scheduleByDay[slot.dayOfWeek]) {
        scheduleByDay[slot.dayOfWeek].push(slot);
      }
    }

    return {
      batch: { id: batch.id, name: batch.name, code: batch.code },
      scheduleByDay,
      allSlots: slots
    };
  }

  /**
   * Get all schedule slots for a teacher (grouped by day)
   */
  static async getTeacherSchedule(instituteId: string, teacherId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId }
    });
    if (!teacher) throw new AppError("Teacher not found in this institute", HTTP_STATUS.NOT_FOUND);

    const slots = await prisma.timetable.findMany({
      where: { teacherId, instituteId, status: ScheduleStatus.ACTIVE },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true } },
        room: { select: { id: true, name: true, code: true, capacity: true, type: true } }
      }
    });

    const scheduleByDay: Record<string, any[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: []
    };

    for (const slot of slots) {
      if (scheduleByDay[slot.dayOfWeek]) {
        scheduleByDay[slot.dayOfWeek].push(slot);
      }
    }

    return {
      teacher: { id: teacher.id, firstName: teacher.firstName, lastName: teacher.lastName, employeeCode: teacher.employeeCode },
      scheduleByDay,
      allSlots: slots
    };
  }

  /**
   * Student Schedule Scoping: Returns only schedule slots for student's active batches
   */
  static async getStudentSchedule(userId: string, instituteId: string) {
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
        teacher: { select: { id: true, firstName: true, lastName: true } },
        room: { select: { id: true, name: true, code: true } }
      }
    });

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
