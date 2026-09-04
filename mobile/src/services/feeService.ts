import { MobileApiService } from "./api";

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

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "GENERAL" | "ACADEMIC" | "EXAM" | "FEE" | "ATTENDANCE" | "TEST" | "ANNOUNCEMENT";
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

export class MobileFeeService {
  static async getOverview(): Promise<StudentFeeOverviewResponse> {
    return MobileApiService.request<StudentFeeOverviewResponse>("/fees/my");
  }

  static async initiatePayment(data: { feeId: string; amount: number; paymentMethod: string }): Promise<any> {
    return MobileApiService.request("/fees/pay", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
}

export class MobileNotificationService {
  static async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return MobileApiService.request<{ notifications: NotificationItem[]; unreadCount: number }>("/notifications/my");
  }

  static async markAsRead(id: string): Promise<any> {
    return MobileApiService.request(`/notifications/${id}/read`, { method: "PATCH" });
  }

  static async markAllAsRead(): Promise<any> {
    return MobileApiService.request("/notifications/mark-all-read", { method: "POST" });
  }
}
