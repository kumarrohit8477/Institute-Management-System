import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { AttendanceStatus, Prisma } from "@prisma/client";
import { BulkAttendanceInput, UpdateSingleAttendanceInput } from "../validations/attendance.validation";

export class AttendanceService {
  /**
   * Bulk mark attendance for an entire batch on a specific date (Admin)
   */
  static async markBulkAttendance(instituteId: string, recordedById: string, input: BulkAttendanceInput) {
    const { batchId, date, attendances } = input;
    const attendanceDate = new Date(date);

    // Verify batch belongs to institute
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    // Verify all student IDs belong to this batch
    const enrolledStudents = await prisma.studentBatch.findMany({
      where: { batchId, status: "ACTIVE" },
      select: { studentId: true }
    });

    const enrolledStudentIdSet = new Set(enrolledStudents.map((s) => s.studentId));

    for (const item of attendances) {
      if (!enrolledStudentIdSet.has(item.studentId)) {
        throw new AppError(
          `Student with ID '${item.studentId}' is not actively enrolled in batch '${batch.name}'`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Upsert attendance records atomically in transaction
    const results = await prisma.$transaction(
      attendances.map((item) =>
        prisma.attendance.upsert({
          where: {
            batchId_studentId_date: {
              batchId,
              studentId: item.studentId,
              date: attendanceDate
            }
          },
          update: {
            status: item.status,
            remarks: item.remarks || null,
            recordedById
          },
          create: {
            instituteId,
            batchId,
            studentId: item.studentId,
            date: attendanceDate,
            status: item.status,
            remarks: item.remarks || null,
            recordedById
          }
        })
      )
    );

    const summary = {
      total: results.length,
      present: results.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: results.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: results.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: results.filter((r) => r.status === AttendanceStatus.EXCUSED).length
    };

    return {
      batchId,
      date,
      summary,
      records: results
    };
  }

  /**
   * Get attendance history for a batch (Admin)
   */
  static async getBatchAttendance(
    instituteId: string,
    batchId: string,
    params: { date?: string; startDate?: string; endDate?: string; page?: number; limit?: number }
  ) {
    const { date, startDate, endDate, page = 1, limit = 100 } = params;
    const skip = (page - 1) * limit;

    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId },
      include: {
        course: { select: { id: true, name: true, code: true } }
      }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const where: Prisma.AttendanceWhereInput = {
      instituteId,
      batchId,
      ...(date ? { date: new Date(date) } : {}),
      ...(startDate && endDate
        ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        : {})
    };

    const [total, records] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { student: { firstName: "asc" } }],
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          recordedBy: { select: { id: true, email: true } }
        }
      })
    ]);

    const summary = {
      totalRecords: total,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length
    };

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        code: batch.code,
        course: batch.course
      },
      summary,
      records,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update single student attendance record (Admin)
   */
  static async updateAttendanceRecord(instituteId: string, id: string, input: UpdateSingleAttendanceInput) {
    const record = await prisma.attendance.findFirst({
      where: { id, instituteId }
    });

    if (!record) {
      throw new AppError("Attendance record not found", HTTP_STATUS.NOT_FOUND);
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.remarks !== undefined ? { remarks: input.remarks } : {})
      },
      include: {
        student: { select: { id: true, admissionNumber: true, firstName: true, lastName: true } },
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    return updated;
  }

  /**
   * Get personal attendance profile & history for authenticated student (Student)
   */
  static async getStudentAttendance(userId: string, instituteId: string, params: { startDate?: string; endDate?: string }) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        batches: {
          where: { status: "ACTIVE" },
          include: {
            batch: {
              include: {
                course: { select: { id: true, name: true, code: true } }
              }
            }
          }
        }
      }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const where: Prisma.AttendanceWhereInput = {
      instituteId,
      studentId: student.id,
      ...(params.startDate && params.endDate
        ? {
            date: {
              gte: new Date(params.startDate),
              lte: new Date(params.endDate)
            }
          }
        : {})
    };

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const lateCount = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const absentCount = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const excusedCount = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;

    // Calculate effective attendance percentage: (present + late) / totalDays * 100
    const attendancePercentage = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 1000) / 10 : 100;

    return {
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        name: `${student.firstName} ${student.lastName}`
      },
      statistics: {
        totalDays,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        attendancePercentage
      },
      enrolledBatches: student.batches.map((b) => b.batch),
      records
    };
  }
}
