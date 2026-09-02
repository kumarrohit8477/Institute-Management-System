import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { StudentBatchStatus } from "@prisma/client";

export class StudentBatchService {
  /**
   * Enroll a student into a batch
   */
  static async assignStudentToBatch(
    instituteId: string,
    batchId: string,
    input: { studentId: string; rollNumber?: string; enrolledAt?: string }
  ) {
    const { studentId, rollNumber, enrolledAt } = input;

    // Verify batch
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId },
      include: {
        _count: {
          select: {
            students: {
              where: { status: StudentBatchStatus.ACTIVE }
            }
          }
        }
      }
    });

    if (!batch) {
      throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // Capacity check
    if (batch._count.students >= batch.maxStrength) {
      throw new AppError(
        `Batch has reached maximum capacity (${batch.maxStrength} students)`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify student
    const student = await prisma.student.findFirst({
      where: { id: studentId, instituteId }
    });

    if (!student) {
      throw new AppError("Student not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const existing = await prisma.studentBatch.findUnique({
      where: {
        studentId_batchId: {
          studentId,
          batchId
        }
      }
    });

    if (existing) {
      if (existing.status === StudentBatchStatus.ACTIVE) {
        throw new AppError("Student is already actively enrolled in this batch", HTTP_STATUS.CONFLICT);
      }
      // Re-activate
      return prisma.studentBatch.update({
        where: { id: existing.id },
        data: {
          status: StudentBatchStatus.ACTIVE,
          rollNumber: rollNumber || existing.rollNumber || student.admissionNumber,
          enrolledAt: enrolledAt ? new Date(enrolledAt) : new Date()
        },
        include: { student: true, batch: true }
      });
    }

    const studentBatch = await prisma.studentBatch.create({
      data: {
        batchId,
        studentId,
        rollNumber: rollNumber || student.admissionNumber,
        enrolledAt: enrolledAt ? new Date(enrolledAt) : new Date(),
        status: StudentBatchStatus.ACTIVE
      },
      include: {
        student: true,
        batch: true
      }
    });

    return studentBatch;
  }

  /**
   * Get all students enrolled in a specific batch
   */
  static async getBatchStudents(instituteId: string, batchId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const enrollments = await prisma.studentBatch.findMany({
      where: { batchId },
      orderBy: { rollNumber: "asc" },
      include: {
        student: {
          include: {
            user: {
              select: { email: true, status: true, lastLoginAt: true }
            }
          }
        }
      }
    });

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        code: batch.code,
        maxStrength: batch.maxStrength,
        enrolledCount: enrollments.length
      },
      students: enrollments
    };
  }

  /**
   * Update student batch status or roll number
   */
  static async updateStudentBatch(
    instituteId: string,
    batchId: string,
    studentId: string,
    input: { rollNumber?: string; status?: StudentBatchStatus }
  ) {
    // Verify batch belongs to institute
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const enrollment = await prisma.studentBatch.findUnique({
      where: {
        studentId_batchId: {
          studentId,
          batchId
        }
      }
    });

    if (!enrollment) {
      throw new AppError("Student is not enrolled in this batch", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.studentBatch.update({
      where: { id: enrollment.id },
      data: {
        ...(input.rollNumber ? { rollNumber: input.rollNumber } : {}),
        ...(input.status ? { status: input.status } : {})
      },
      include: { student: true, batch: true }
    });

    return updated;
  }

  /**
   * Remove a student from a batch
   */
  static async removeStudentFromBatch(instituteId: string, batchId: string, studentId: string) {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const enrollment = await prisma.studentBatch.findUnique({
      where: {
        studentId_batchId: {
          studentId,
          batchId
        }
      }
    });

    if (!enrollment) {
      throw new AppError("Student is not enrolled in this batch", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.studentBatch.delete({
      where: { id: enrollment.id }
    });

    return { removed: true, batchId, studentId };
  }
}
