import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { BatchStatus, Prisma } from "@prisma/client";
import { CreateBatchInput, CreateBatchWizardInput, UpdateBatchInput } from "../validations/batch.validation";
import { BatchSubjectStatus, AssignmentStatus, ScheduleStatus, DayOfWeek, ClassType } from "@prisma/client";
import { TimeUtil } from "../utils/timeUtil";

export class BatchService {
  /**
   * Create a new batch under a course
   */
  static async createBatch(instituteId: string, input: CreateBatchInput) {
    const { courseId, name, code, academicSession, description, startDate, endDate, maxStrength = 60, status } = input;

    // Verify course
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });

    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.batch.findUnique({
      where: {
        instituteId_code: {
          instituteId,
          code: code.toUpperCase()
        }
      }
    });

    if (existing) {
      throw new AppError(`Batch code '${code}' already exists in this institute`, HTTP_STATUS.CONFLICT);
    }

    const batch = await prisma.batch.create({
      data: {
        instituteId,
        courseId,
        name,
        code: code.toUpperCase(),
        academicSession: academicSession || null,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxStrength,
        status: status || BatchStatus.ACTIVE
      },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    return batch;
  }

  /**
   * Transactional Multi-Step Batch Creation (Wizard: Batch + BatchSubjects + TeacherAssignments + Timetable)
   */
  static async createBatchWithAcademics(instituteId: string, input: CreateBatchWizardInput) {
    const {
      courseId,
      name,
      code,
      academicSession,
      description,
      startDate,
      endDate,
      maxStrength = 60,
      status = BatchStatus.ACTIVE,
      subjects = [],
      schedules = []
    } = input;

    // 1. Verify course belongs to institute
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Prevent duplicate batch code in institute
    const existing = await prisma.batch.findUnique({
      where: {
        instituteId_code: {
          instituteId,
          code: code.toUpperCase()
        }
      }
    });
    if (existing) {
      throw new AppError(`Batch code '${code}' already exists in this institute`, HTTP_STATUS.CONFLICT);
    }

    // 3. Pre-validate schedule conflicts
    for (const sched of schedules) {
      const normalizedStart = TimeUtil.normalizeTime(sched.startTime);
      const normalizedEnd = TimeUtil.normalizeTime(sched.endTime);

      if (TimeUtil.parseTimeToMinutes(normalizedStart) >= TimeUtil.parseTimeToMinutes(normalizedEnd)) {
        throw new AppError(`Class start time (${sched.startTime}) must be before end time (${sched.endTime})`, HTTP_STATUS.BAD_REQUEST);
      }

      // Check Teacher conflict across other batches
      const teacherConflict = await prisma.timetable.findFirst({
        where: {
          instituteId,
          teacherId: sched.teacherId,
          dayOfWeek: sched.dayOfWeek as DayOfWeek,
          status: ScheduleStatus.ACTIVE
        },
        include: { teacher: true, batch: true, subject: true }
      });

      if (
        teacherConflict &&
        TimeUtil.areIntervalsOverlapping(normalizedStart, normalizedEnd, teacherConflict.startTime, teacherConflict.endTime)
      ) {
        throw new AppError(
          `Teacher conflict: ${teacherConflict.teacher.firstName} ${teacherConflict.teacher.lastName} is already assigned to ${teacherConflict.batch.name} (${teacherConflict.subject.name}) from ${teacherConflict.startTime} to ${teacherConflict.endTime} on ${sched.dayOfWeek}.`,
          HTTP_STATUS.CONFLICT
        );
      }

      // Check Room conflict if roomId specified
      if (sched.roomId) {
        const roomConflict = await prisma.timetable.findFirst({
          where: {
            instituteId,
            roomId: sched.roomId,
            dayOfWeek: sched.dayOfWeek as DayOfWeek,
            status: ScheduleStatus.ACTIVE
          },
          include: { room: true, batch: true }
        });

        if (
          roomConflict &&
          TimeUtil.areIntervalsOverlapping(normalizedStart, normalizedEnd, roomConflict.startTime, roomConflict.endTime)
        ) {
          throw new AppError(
            `Room conflict: Room '${roomConflict.room?.name || roomConflict.room?.code}' is already occupied by ${roomConflict.batch.name} during ${sched.startTime} - ${sched.endTime} on ${sched.dayOfWeek}.`,
            HTTP_STATUS.CONFLICT
          );
        }
      }
    }

    // 4. Atomic Execution in a Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Create Batch
      const createdBatch = await tx.batch.create({
        data: {
          instituteId,
          courseId,
          name,
          code: code.toUpperCase(),
          academicSession: academicSession || null,
          description: description || null,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          maxStrength,
          status
        }
      });

      // 4b. Create Batch Subjects & sync teacher qualifications/assignments
      const createdBatchSubjectsMap = new Map<string, string>(); // subjectId -> batchSubjectId
      for (const sub of subjects) {
        if (sub.assignedTeacherId) {
          // Register qualification if not present
          await tx.teacherSubject.upsert({
            where: { teacherId_subjectId: { teacherId: sub.assignedTeacherId, subjectId: sub.subjectId } },
            update: {},
            create: { teacherId: sub.assignedTeacherId, subjectId: sub.subjectId }
          });

          // Sync TeacherAssignment
          await tx.teacherAssignment.upsert({
            where: {
              teacherId_batchId_subjectId: {
                teacherId: sub.assignedTeacherId,
                batchId: createdBatch.id,
                subjectId: sub.subjectId
              }
            },
            update: { status: AssignmentStatus.ACTIVE },
            create: {
              instituteId,
              teacherId: sub.assignedTeacherId,
              courseId,
              subjectId: sub.subjectId,
              batchId: createdBatch.id,
              status: AssignmentStatus.ACTIVE
            }
          });
        }

        const batchSub = await tx.batchSubject.create({
          data: {
            batchId: createdBatch.id,
            subjectId: sub.subjectId,
            assignedTeacherId: sub.assignedTeacherId || null,
            startDate: sub.startDate ? new Date(sub.startDate) : null,
            expectedEndDate: sub.expectedEndDate ? new Date(sub.expectedEndDate) : null,
            status: BatchSubjectStatus.NOT_STARTED,
            progress: 0,
            notes: sub.notes || null
          }
        });

        createdBatchSubjectsMap.set(sub.subjectId, batchSub.id);
      }

      // 4c. Create initial timetable slots
      for (const sched of schedules) {
        const batchSubjectId = createdBatchSubjectsMap.get(sched.subjectId) || null;

        await tx.timetable.create({
          data: {
            instituteId,
            batchId: createdBatch.id,
            subjectId: sched.subjectId,
            teacherId: sched.teacherId,
            roomId: sched.roomId || null,
            batchSubjectId,
            dayOfWeek: sched.dayOfWeek as DayOfWeek,
            startTime: TimeUtil.normalizeTime(sched.startTime),
            endTime: TimeUtil.normalizeTime(sched.endTime),
            meetingLink: sched.meetingLink || null,
            classType: (sched.classType as ClassType) || ClassType.OFFLINE,
            status: ScheduleStatus.ACTIVE
          }
        });
      }

      return createdBatch;
    });

    // Return complete newly created batch details
    return this.getBatchById(instituteId, result.id);
  }

  /**
   * List batches with filters
   */
  static async getBatches(instituteId: string, params: { courseId?: string; search?: string; status?: BatchStatus; page?: number; limit?: number }) {
    const { courseId, search, status, page = 1, limit = 50 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.BatchWhereInput = {
      instituteId,
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { academicSession: { contains: search } }
            ]
          }
        : {})
    };

    const [total, batches] = await Promise.all([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, name: true, code: true } },
          batchSubjects: {
            include: {
              subject: { select: { id: true, name: true, code: true } },
              assignedTeacher: { select: { id: true, firstName: true, lastName: true } }
            }
          },
          _count: {
            select: {
              students: true,
              batchSubjects: true,
              teacherAssignments: true,
              timetables: true
            }
          }
        }
      })
    ]);

    return {
      batches,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get single batch with enrolled students, batch subjects, and timetable
   */
  static async getBatchById(instituteId: string, id: string) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId },
      include: {
        course: {
          include: {
            courseSubjects: {
              orderBy: { displayOrder: "asc" },
              include: { subject: true }
            }
          }
        },
        batchSubjects: {
          include: {
            subject: {
              include: {
                teachers: {
                  include: {
                    teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true, specialization: true } }
                  }
                }
              }
            },
            assignedTeacher: {
              select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, phone: true, specialization: true }
            }
          }
        },
        students: {
          orderBy: { rollNumber: "asc" },
          include: {
            student: {
              select: {
                id: true,
                admissionNumber: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                status: true
              }
            }
          }
        },
        timetables: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          include: {
            subject: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
            room: { select: { id: true, name: true, code: true, capacity: true, type: true } }
          }
        },
        _count: {
          select: {
            students: true,
            batchSubjects: true,
            timetables: true
          }
        }
      }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    return batch;
  }

  /**
   * Update batch details
   */
  static async updateBatch(instituteId: string, id: string, input: UpdateBatchInput) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const { name, code, academicSession, description, startDate, endDate, maxStrength, status } = input;

    if (code && code.toUpperCase() !== batch.code) {
      const existing = await prisma.batch.findUnique({
        where: {
          instituteId_code: {
            instituteId,
            code: code.toUpperCase()
          }
        }
      });
      if (existing) {
        throw new AppError(`Batch code '${code}' already exists`, HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(academicSession !== undefined ? { academicSession } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(maxStrength !== undefined ? { maxStrength } : {}),
        ...(status ? { status } : {})
      },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  }

  /**
   * Update batch status directly
   */
  static async updateBatchStatus(instituteId: string, id: string, status: BatchStatus) {
    return this.updateBatch(instituteId, id, { status });
  }

  /**
   * Delete a batch
   */
  static async deleteBatch(instituteId: string, id: string) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId },
      include: {
        _count: { select: { students: true, tests: true } }
      }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    if (batch._count.students > 0) {
      throw new AppError(
        `Cannot delete batch: It has ${batch._count.students} enrolled student(s). Transfer or remove students first.`,
        HTTP_STATUS.CONFLICT
      );
    }

    await prisma.batch.delete({
      where: { id }
    });

    return { success: true, message: "Batch deleted successfully" };
  }
}

