import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "@ims/common";
import { BatchStatus, Prisma } from "@prisma/client";
import { CreateBatchInput, UpdateBatchInput } from "../validations/batch.validation";

export class BatchService {
  /**
   * Create a new batch under a course
   */
  static async createBatch(instituteId: string, input: CreateBatchInput) {
    const { courseId, name, code, startDate, endDate, maxStrength = 60, status } = input;

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
   * List batches with filters
   */
  static async getBatches(instituteId: string, params: { courseId?: string; search?: string; status?: BatchStatus; page?: number; limit?: number }) {
    const { courseId, search, status, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BatchWhereInput = {
      instituteId,
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } }
            ]
          }
        : {})
    };

    const [total, batches] = await Promise.all([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, name: true, code: true } },
          _count: {
            select: {
              students: true,
              teacherAssignments: true
            }
          }
        }
      })
    ]);

    return {
      batches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single batch with enrolled students and teacher assignments
   */
  static async getBatchById(instituteId: string, id: string) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId },
      include: {
        course: true,
        students: {
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
        teacherAssignments: {
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
            subject: { select: { id: true, name: true, code: true } }
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
   * Update batch details or status
   */
  static async updateBatch(instituteId: string, id: string, input: UpdateBatchInput) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    const { name, code, startDate, endDate, maxStrength, status } = input;

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
   * Delete a batch
   */
  static async deleteBatch(instituteId: string, id: string) {
    const batch = await prisma.batch.findFirst({
      where: { id, instituteId }
    });

    if (!batch) {
      throw new AppError("Batch not found", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.batch.delete({
      where: { id }
    });

    return { success: true, message: "Batch deleted successfully" };
  }
}

