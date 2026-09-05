import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { StudentBatchStatus, UserRole, UserStatus } from "@prisma/client";
import { EmailService } from "./email.service";
import { PasswordUtil } from "../utils/password";

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
      throw new AppError("Batch capacity has been reached.", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify student and check user account
    let student = await prisma.student.findFirst({
      where: { id: studentId, instituteId },
      include: { user: true }
    });

    if (!student) {
      throw new AppError("Student not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // Auto-create User account if missing
    let generatedPassword: string | undefined;
    if (!student.userId || !student.user) {
      generatedPassword = "StudentPassword123!";
      const passwordHash = await PasswordUtil.hash(generatedPassword);
      const user = await prisma.user.create({
        data: {
          instituteId,
          email: student.email.toLowerCase(),
          passwordHash,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE
        }
      });
      student = await prisma.student.update({
        where: { id: student.id },
        data: { userId: user.id },
        include: { user: true }
      });
    }

    const existing = await prisma.studentBatch.findUnique({
      where: {
        studentId_batchId: {
          studentId,
          batchId
        }
      }
    });

    let studentBatch;
    if (existing) {
      if (existing.status === StudentBatchStatus.ACTIVE) {
        throw new AppError("Student is already actively enrolled in this batch", HTTP_STATUS.CONFLICT);
      }
      // Re-activate
      studentBatch = await prisma.studentBatch.update({
        where: { id: existing.id },
        data: {
          status: StudentBatchStatus.ACTIVE,
          rollNumber: rollNumber || existing.rollNumber || student.admissionNumber,
          enrolledAt: enrolledAt ? new Date(enrolledAt) : new Date()
        },
        include: { student: true, batch: true }
      });
    } else {
      studentBatch = await prisma.studentBatch.create({
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
    }

    // Send email with student credentials and batch enrollment info
    (async () => {
      try {
        const institute = await prisma.institute.findUnique({
          where: { id: instituteId },
          select: { name: true }
        });

        await EmailService.sendStudentCredentials({
          toEmail: student.email,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber,
          password: generatedPassword,
          instituteName: institute?.name || "Institute Management System",
          batchName: batch.name
        });
      } catch (err) {
        console.error("[BATCH ENROLLMENT EMAIL FAILED]", err);
      }
    })();

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
