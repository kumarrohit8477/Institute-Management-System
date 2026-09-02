import { MobileApiService } from "./api";

export class MobileFeeService {
  static async getOverview(): Promise<any> {
    return MobileApiService.request("/fees/my");
  }
}

export class MobileNotificationService {
  static async getNotifications(): Promise<any> {
    return MobileApiService.request("/notifications/my");
  }

  static async markAsRead(id: string): Promise<any> {
    return MobileApiService.request(`/notifications/${id}/read`, { method: "PATCH" });
  }

  static async markAllAsRead(): Promise<any> {
    return MobileApiService.request("/notifications/mark-all-read", { method: "POST" });
  }
}
