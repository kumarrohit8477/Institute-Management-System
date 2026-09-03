import ApiService from "@/src/services/api";

export interface StudentFeeInvoice {
  id: string;
  title: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
  createdAt: string;
  batch?: { id: string; name: string; code: string } | null;
  payments: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "CHEQUE" | "OTHER";
    transactionReference?: string | null;
    paymentDate: string;
    remarks?: string | null;
  }>;
}

export interface StudentFeeOverviewResponse {
  student: { id: string; admissionNumber: string; name: string };
  summary: {
    totalBilled: number;
    totalPaid: number;
    totalDiscount: number;
    totalOutstanding: number;
    nextDueDate: string | null;
  };
  invoices: StudentFeeInvoice[];
  paymentHistory: Array<{
    id: string;
    receiptNumber: string;
    feeTitle: string;
    amount: number;
    paymentMethod: string;
    transactionReference?: string | null;
    paymentDate: string;
    remarks?: string | null;
  }>;
}

export class FeeApiService {
  /**
   * Fetch complete student fee profile, invoices, balance, and payment receipts
   */
  static async getMyFeeOverview(): Promise<StudentFeeOverviewResponse> {
    return ApiService.request<StudentFeeOverviewResponse>("/fees/my");
  }
}
