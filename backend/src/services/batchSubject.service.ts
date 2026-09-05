import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { BatchSubjectStatus, AssignmentStatus } from "@prisma/client";
import { AddBatchSubjectInput, UpdateBatchSubjectInput } from "../validations/batchSubject.validation";

export class BatchSubjectService {
  /**
   * Add a subject to a batch
   */
  static async addSubjectToBatch(instituteId: string, batchId: string, input: AddBatchSubjectInput) {
    const { subjectId, assignedTeacherId, startDate, expectedEndDate, status = BatchSubjectStatus.NOT_STARTED, progress = 0, notes } = input;

    // 1. Verify batch belongs to institute
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });
    if (!batch) {
      throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Verify subject belongs to institute
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId }
    });
    if (!subject) {
      throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 3. Verify teacher if provided
    if (assignedTeacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: assignedTeacherId, instituteId }
      });
      if (!teacher) {
        throw new AppError("Assigned teacher not found in this institute", HTTP_STATUS.NOT_FOUND);
      }

      // Auto-register qualification if not already present
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: assignedTeacherId, subjectId } },
        update: {},
        create: { teacherId: assignedTeacherId, subjectId }
      });
    }

    // 4. Check if subject already added to this batch
    const existing = await prisma.batchSubject.findUnique({
      where: {
        batchId_subjectId: {
          batchId,
          subjectId
        }
      }
    });

    if (existing) {
      throw new AppError("This subject is already configured for this batch", HTTP_STATUS.CONFLICT);
    }

    const batchSubject = await prisma.batchSubject.create({
      data: {
        batchId,
        subjectId,
        assignedTeacherId: assignedTeacherId || null,
        startDate: startDate ? new Date(startDate) : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        status,
        progress,
        notes
      },
      include: {
        subject: true,
        assignedTeacher: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, phone: true, specialization: true }
        },
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    // Also sync teacher assignment for backwards compatibility
    if (assignedTeacherId) {
      await prisma.teacherAssignment.upsert({
        where: {
          teacherId_batchId_subjectId: {
            teacherId: assignedTeacherId,
            batchId,
            subjectId
          }
        },
        update: { status: AssignmentStatus.ACTIVE },
        create: {
          instituteId,
          teacherId: assignedTeacherId,
          courseId: batch.courseId,
          subjectId,
          batchId,
          status: AssignmentStatus.ACTIVE
        }
      });
    }

    return batchSubject;
  }

  /**
   * Get all subjects mapped to a batch
   */
  static async getBatchSubjects(instituteId: string, batchId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });
    if (!batch) {
      throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const batchSubjects = await prisma.batchSubject.findMany({
      where: { batchId },
      include: {
        subject: {
          include: {
            teachers: {
              include: {
                teacher: {
                  select: { id: true, firstName: true, lastName: true, employeeCode: true, specialization: true }
                }
              }
            }
          }
        },
        assignedTeacher: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, phone: true, specialization: true }
        }
      }
    });

    return batchSubjects;
  }

  /**
   * Update batch subject details (status, progress, teacher, notes)
   */
  static async updateBatchSubject(instituteId: string, id: string, input: UpdateBatchSubjectInput) {
    const batchSubject = await prisma.batchSubject.findFirst({
      where: { id },
      include: { batch: true }
    });

    if (!batchSubject || batchSubject.batch.instituteId !== instituteId) {
      throw new AppError("Batch subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    if (input.assignedTeacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: input.assignedTeacherId, instituteId }
      });
      if (!teacher) {
        throw new AppError("Assigned teacher not found in this institute", HTTP_STATUS.NOT_FOUND);
      }

      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: input.assignedTeacherId, subjectId: batchSubject.subjectId } },
        update: {},
        create: { teacherId: input.assignedTeacherId, subjectId: batchSubject.subjectId }
      });

      // Sync teacher assignment
      await prisma.teacherAssignment.upsert({
        where: {
          teacherId_batchId_subjectId: {
            teacherId: input.assignedTeacherId,
            batchId: batchSubject.batchId,
            subjectId: batchSubject.subjectId
          }
        },
        update: { status: AssignmentStatus.ACTIVE },
        create: {
          instituteId,
          teacherId: input.assignedTeacherId,
          courseId: batchSubject.batch.courseId,
          subjectId: batchSubject.subjectId,
          batchId: batchSubject.batchId,
          status: AssignmentStatus.ACTIVE
        }
      });
    }

    const updated = await prisma.batchSubject.update({
      where: { id },
      data: {
        ...(input.assignedTeacherId !== undefined ? { assignedTeacherId: input.assignedTeacherId } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.progress !== undefined ? { progress: input.progress } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate ? new Date(input.startDate) : null } : {}),
        ...(input.expectedEndDate !== undefined ? { expectedEndDate: input.expectedEndDate ? new Date(input.expectedEndDate) : null } : {})
      },
      include: {
        subject: true,
        assignedTeacher: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, phone: true, specialization: true }
        },
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  }

  /**
   * Assign or change teacher for a batch subject
   */
  static async assignTeacher(instituteId: string, id: string, teacherId: string) {
    return this.updateBatchSubject(instituteId, id, { assignedTeacherId: teacherId });
  }

  /**
   * Remove a subject from a batch
   */
  static async removeBatchSubject(instituteId: string, id: string) {
    const batchSubject = await prisma.batchSubject.findFirst({
      where: { id },
      include: { batch: true }
    });

    if (!batchSubject || batchSubject.batch.instituteId !== instituteId) {
      throw new AppError("Batch subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // Check if timetable classes exist for this batch subject
    const timetableCount = await prisma.timetable.count({
      where: {
        batchId: batchSubject.batchId,
        subjectId: batchSubject.subjectId
      }
    });

    if (timetableCount > 0) {
      throw new AppError(
        `Cannot remove subject from batch: There are ${timetableCount} active timetable schedule slot(s) for this subject. Remove the classes first.`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Clean up corresponding teacher assignment
    if (batchSubject.assignedTeacherId) {
      await prisma.teacherAssignment.deleteMany({
        where: {
          batchId: batchSubject.batchId,
          subjectId: batchSubject.subjectId,
          teacherId: batchSubject.assignedTeacherId
        }
      });
    }

    await prisma.batchSubject.delete({
      where: { id }
    });

    return { success: true, message: "Subject removed from batch successfully" };
  }
}
