import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const recordPaymentSchema = z.object({
  body: z.object({
    feeId: z.string({ required_error: "Fee ID is required" }),
    amount: z.coerce.number().positive("Payment amount must be greater than 0"),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
    transactionReference: z.string().optional().nullable(),
    paymentDate: z.string().optional(),
    remarks: z.string().optional().nullable()
  })
});

export const paymentQuerySchema = z.object({
  query: z.object({
    feeId: z.string().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50)
  })
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>["body"];
export type PaymentQueryParams = z.infer<typeof paymentQuerySchema>["query"];
