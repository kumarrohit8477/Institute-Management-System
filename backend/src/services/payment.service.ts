import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { HTTP_STATUS } from "../common";
import { FeeStatus, Prisma } from "@prisma/client";
import { RecordPaymentInput, PaymentQueryParams } from "../validations/payment.validation";

export class PaymentService {
  /**
   * Record a payment transaction for a fee invoice (Admin)
   */
  static async recordPayment(instituteId: string, receivedById: string, input: RecordPaymentInput) {
    const { feeId, amount, paymentMethod, transactionReference, paymentDate, remarks } = input;

    // Verify fee exists in institute
    const fee = await prisma.fee.findFirst({
      where: { id: feeId, instituteId },
      include: { student: true }
    });

    if (!fee) {
      throw new AppError("Fee invoice not found in this institute", HTTP_STATUS.NOT_FOUND);
    }

    const currentPaid = Number(fee.paidAmount);
    const finalAmount = Number(fee.finalAmount);
    const outstanding = finalAmount - currentPaid;

    if (amount > outstanding) {
      throw new AppError(
        `Payment amount (₹${amount}) exceeds remaining outstanding balance (₹${outstanding})`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Auto-generate receipt number inside transaction: RCP-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const count = await tx.payment.count();
      const receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(4, "0")}`;

      const payment = await tx.payment.create({
        data: {
          feeId,
          receiptNumber,
          amount,
          paymentMethod,
          transactionReference: transactionReference || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          receivedById,
          remarks: remarks || null
        },
        include: {
          receivedBy: { select: { id: true, email: true } },
          fee: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } }
            }
          }
        }
      });

      const newPaidTotal = currentPaid + amount;
      const newStatus = newPaidTotal >= finalAmount ? FeeStatus.PAID : FeeStatus.PARTIALLY_PAID;

      await tx.fee.update({
        where: { id: feeId },
        data: {
          paidAmount: newPaidTotal,
          status: newStatus
        }
      });

      return payment;
    });

    return result;
  }

  /**
   * Get payment transactions list (Admin)
   */
  static async getPayments(instituteId: string, params: PaymentQueryParams) {
    const { feeId, paymentMethod, startDate, endDate, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      fee: { instituteId },
      ...(feeId ? { feeId } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(startDate && endDate
        ? {
            paymentDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        : {})
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: "desc" },
        include: {
          receivedBy: { select: { id: true, email: true } },
          fee: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
              batch: { select: { id: true, name: true, code: true } }
            }
          }
        }
      })
    ]);

    return {
      payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get payment receipt by ID
   */
  static async getPaymentById(instituteId: string, id: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, fee: { instituteId } },
      include: {
        receivedBy: { select: { id: true, email: true } },
        fee: {
          include: {
            institute: { select: { id: true, name: true, code: true, address: true, logoUrl: true } },
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
            batch: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });

    if (!payment) {
      throw new AppError("Payment receipt not found", HTTP_STATUS.NOT_FOUND);
    }

    return payment;
  }

  /**
   * Get complete financial overview for authenticated student
   */
  static async getStudentFeeOverview(userId: string, instituteId: string) {
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new AppError("Student profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const fees = await prisma.fee.findMany({
      where: {
        instituteId,
        studentId: student.id
      },
      orderBy: { dueDate: "asc" },
      include: {
        batch: { select: { id: true, name: true, code: true } },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: {
            receivedBy: { select: { id: true, email: true } }
          }
        }
      }
    });

    let totalBilled = 0;
    let totalPaid = 0;
    let totalDiscount = 0;
    let nextDueDate: Date | null = null;

    const allPayments: any[] = [];

    for (const f of fees) {
      totalBilled += Number(f.finalAmount);
      totalPaid += Number(f.paidAmount);
      totalDiscount += Number(f.discountAmount);

      if (f.status !== FeeStatus.PAID && f.status !== FeeStatus.CANCELLED) {
        if (!nextDueDate || new Date(f.dueDate) < nextDueDate) {
          nextDueDate = new Date(f.dueDate);
        }
      }

      for (const p of f.payments) {
        allPayments.push({
          ...p,
          feeTitle: f.title
        });
      }
    }

    allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    const totalOutstanding = totalBilled - totalPaid;

    return {
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        name: `${student.firstName} ${student.lastName}`
      },
      summary: {
        totalBilled,
        totalPaid,
        totalDiscount,
        totalOutstanding,
        nextDueDate
      },
      invoices: fees,
      paymentHistory: allPayments
    };
  }
}
