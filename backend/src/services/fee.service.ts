import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { FeeStatus, Prisma } from "@prisma/client";
import { CreateFeeInput, UpdateFeeInput, FeeQueryParams } from "../validations/fee.validation";

export class FeeService {
  /**
   * Create a new student fee invoice (Admin)
   */
  static async createFee(instituteId: string, input: CreateFeeInput) {
    const { studentId, batchId, title, totalAmount, discountAmount = 0, dueDate, status = FeeStatus.PENDING } = input;

    // Verify student exists in institute
    const student = await prisma.student.findFirst({
      where: { id: studentId, instituteId }
    });

    if (!student) {
      throw new AppError("Student not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    if (batchId) {
      const batch = await prisma.batch.findFirst({
        where: { id: batchId, instituteId }
      });
      if (!batch) {
        throw new AppError("Batch not found in this institute", HTTP_STATUS.NOT_FOUND);
      }
    }

    if (discountAmount > totalAmount) {
      throw new AppError("Discount amount cannot exceed total fee amount", HTTP_STATUS.BAD_REQUEST);
    }

    const finalAmount = totalAmount - discountAmount;

    const fee = await prisma.fee.create({
      data: {
        instituteId,
        studentId,
        batchId: batchId || null,
        title,
        totalAmount,
        discountAmount,
        finalAmount,
        paidAmount: 0.0,
        dueDate: new Date(dueDate),
        status
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, email: true } },
        batch: { select: { id: true, name: true, code: true } }
      }
    });

    return fee;
  }

  /**
   * Get paginated fee invoices with aggregates (Admin)
   */
  static async getFees(instituteId: string, params: FeeQueryParams) {
    const { studentId, batchId, status, search, page = 1, limit = 50 } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.FeeWhereInput = {
      instituteId,
      ...(studentId ? { studentId } : {}),
      ...(batchId ? { batchId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { student: { firstName: { contains: search } } },
              { student: { lastName: { contains: search } } },
              { student: { admissionNumber: { contains: search } } }
            ]
          }
        : {})
    };

    const [total, fees, allMatchingFees] = await Promise.all([
      prisma.fee.count({ where }),
      prisma.fee.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dueDate: "asc" },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, email: true } },
          batch: { select: { id: true, name: true, code: true } },
          _count: { select: { payments: true } }
        }
      }),
      prisma.fee.findMany({
        where,
        select: { finalAmount: true, paidAmount: true }
      })
    ]);

    const aggregateTotalBilled = allMatchingFees.reduce((acc, curr) => acc + Number(curr.finalAmount || 0), 0);
    const aggregateTotalPaid = allMatchingFees.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0);
    const aggregateTotalOutstanding = Math.max(0, aggregateTotalBilled - aggregateTotalPaid);

    return {
      fees,
      summary: {
        totalBilled: aggregateTotalBilled,
        totalPaid: aggregateTotalPaid,
        totalOutstanding: aggregateTotalOutstanding
      },
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get single fee invoice with payment receipts
   */
  static async getFeeById(instituteId: string, id: string) {
    const fee = await prisma.fee.findFirst({
      where: { id, instituteId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            email: true,
            phone: true
          }
        },
        batch: { select: { id: true, name: true, code: true } },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: {
            receivedBy: { select: { id: true, email: true } }
          }
        }
      }
    });

    if (!fee) {
      throw new AppError("Fee invoice not found", HTTP_STATUS.NOT_FOUND);
    }

    return fee;
  }

  /**
   * Update fee invoice (Admin)
   */
  static async updateFee(instituteId: string, id: string, input: UpdateFeeInput) {
    const existing = await prisma.fee.findFirst({
      where: { id, instituteId }
    });

    if (!existing) {
      throw new AppError("Fee invoice not found", HTTP_STATUS.NOT_FOUND);
    }

    const totalAmount = input.totalAmount !== undefined ? input.totalAmount : Number(existing.totalAmount);
    const discountAmount = input.discountAmount !== undefined ? input.discountAmount : Number(existing.discountAmount);
    const finalAmount = totalAmount - discountAmount;

    const paidAmount = Number(existing.paidAmount);
    let autoStatus = input.status || existing.status;

    if (!input.status) {
      if (paidAmount >= finalAmount) {
        autoStatus = FeeStatus.PAID;
      } else if (paidAmount > 0) {
        autoStatus = FeeStatus.PARTIALLY_PAID;
      }
    }

    const updated = await prisma.fee.update({
      where: { id },
      data: {
        ...(input.batchId !== undefined ? { batchId: input.batchId } : {}),
        ...(input.title ? { title: input.title } : {}),
        totalAmount,
        discountAmount,
        finalAmount,
        ...(input.dueDate ? { dueDate: new Date(input.dueDate) } : {}),
        status: autoStatus
      },
      include: {
        student: true,
        batch: true
      }
    });

    return updated;
  }

  /**
   * Delete fee invoice (Admin)
   */
  static async deleteFee(instituteId: string, id: string) {
    const existing = await prisma.fee.findFirst({
      where: { id, instituteId },
      include: { _count: { select: { payments: true } } }
    });

    if (!existing) {
      throw new AppError("Fee invoice not found", HTTP_STATUS.NOT_FOUND);
    }

    if (existing._count.payments > 0) {
      throw new AppError("Cannot delete a fee invoice that has recorded payment transactions", HTTP_STATUS.BAD_REQUEST);
    }

    await prisma.fee.delete({ where: { id } });
    return { deleted: true, id };
  }
}
