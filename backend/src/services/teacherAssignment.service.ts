import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { AssignmentStatus } from "@prisma/client";
import { AssignTeacherBatchInput } from "../validations/assignment.validation";

export class TeacherAssignmentService {
  /**
   * Assign a teacher to a qualified subject (Teacher -> Subject)
   */
  static async assignTeacherToSubject(instituteId: string, teacherId: string, subjectId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId }
    });

    if (!subject) {
      throw new AppError("Subject not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId,
          subjectId
        }
      }
    });

    if (existing) {
      throw new AppError("Teacher is already assigned to this subject", HTTP_STATUS.CONFLICT);
    }

    const assignment = await prisma.teacherSubject.create({
      data: {
        teacherId,
        subjectId
      },
      include: {
        teacher: true,
        subject: true
      }
    });

    return assignment;
  }

  /**
   * Get all subjects assigned to a teacher
   */
  static async getTeacherSubjects(instituteId: string, teacherId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher not found", HTTP_STATUS.NOT_FOUND);
    }

    const subjects = await prisma.teacherSubject.findMany({
      where: { teacherId },
      include: {
        subject: {
          include: {
            course: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });

    return subjects;
  }

  /**
   * Remove a subject qualification from a teacher
   */
  static async removeTeacherSubject(instituteId: string, teacherId: string, subjectId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId }
    });

    if (!teacher) {
      throw new AppError("Teacher not found", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId,
          subjectId
        }
      }
    });

    if (!existing) {
      throw new AppError("Teacher is not assigned to this subject", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.teacherSubject.delete({
      where: { id: existing.id }
    });

    return { removed: true, teacherId, subjectId };
  }

  /**
   * Assign Teacher to a Subject in a Batch (Teacher -> Subject -> Batch)
   */
  static async assignTeacherToBatch(instituteId: string, input: AssignTeacherBatchInput) {
    const { teacherId, courseId, subjectId, batchId, status = AssignmentStatus.ACTIVE } = input;

    // 1. Verify Teacher
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, instituteId }
    });
    if (!teacher) {
      throw new AppError("Teacher not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Verify Course
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId }
    });
    if (!course) {
      throw new AppError("Course not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // 3. Verify Subject belongs to Course
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, courseId, instituteId }
    });
    if (!subject) {
      throw new AppError("Subject not found or does not belong to the specified course", HTTP_STATUS.NOT_FOUND);
    }

    // 4. Verify Batch belongs to Course
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, courseId, instituteId }
    });
    if (!batch) {
      throw new AppError("Batch not found or does not belong to the specified course", HTTP_STATUS.NOT_FOUND);
    }

    // 5. Ensure Teacher is qualified for Subject (auto-link if not already linked)
    await prisma.teacherSubject.upsert({
      where: {
        teacherId_subjectId: { teacherId, subjectId }
      },
      update: {},
      create: { teacherId, subjectId }
    });

    // 6. Check existing assignment
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_batchId_subjectId: {
          teacherId,
          batchId,
          subjectId
        }
      }
    });

    if (existing) {
      return prisma.teacherAssignment.update({
        where: { id: existing.id },
        data: { status },
        include: { teacher: true, course: true, subject: true, batch: true }
      });
    }

    const assignment = await prisma.teacherAssignment.create({
      data: {
        instituteId,
        teacherId,
        courseId,
        subjectId,
        batchId,
        status
      },
      include: {
        teacher: true,
        course: true,
        subject: true,
        batch: true
      }
    });

    return assignment;
  }

  /**
   * Get all teacher assignments for a batch
   */
  static async getBatchAssignments(instituteId: string, batchId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where: { batchId, instituteId },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, phone: true } },
        subject: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } }
      }
    });

    return assignments;
  }

  /**
   * Remove a teacher assignment
   */
  static async removeAssignment(instituteId: string, assignmentId: string) {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: { id: assignmentId, instituteId }
    });

    if (!assignment) {
      throw new AppError("Teacher assignment not found", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.teacherAssignment.delete({
      where: { id: assignmentId }
    });

    return { removed: true, assignmentId };
  }
}
