import ApiService from "@/src/services/api";

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ANNOUNCEMENT" | "ATTENDANCE" | "TEST" | "RESULT" | "FEE" | "TIMETABLE" | "SYSTEM";
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  unreadCount: number;
  notifications: StudentNotificationItem[];
}

export class NotificationApiService {
  /**
   * Fetch student's notifications list and unread count
   */
  static async getMyNotifications(params?: { isRead?: "true" | "false"; type?: string }): Promise<NotificationListResponse> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.request<NotificationListResponse>(`/notifications/my${query ? `?${query}` : ""}`);
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(id: string): Promise<StudentNotificationItem> {
    return ApiService.request<StudentNotificationItem>(`/notifications/${id}/read`, {
      method: "PATCH"
    });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ updatedCount: number }> {
    return ApiService.request<{ updatedCount: number }>("/notifications/mark-all-read", {
      method: "POST"
    });
  }
}
