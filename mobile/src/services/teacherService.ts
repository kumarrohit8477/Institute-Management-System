import { MobileApiService } from "./api";

export class MobileTeacherService {
  static async getDashboard(): Promise<any> {
    return MobileApiService.request("/teacher-portal/dashboard");
  }

  static async getBatches(): Promise<any> {
    return MobileApiService.request("/teacher-portal/batches");
  }

  static async getTimetable(): Promise<any> {
    return MobileApiService.request("/timetable/my");
  }

  static async markAttendance(data: any): Promise<any> {
    return MobileApiService.request("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async getBatchStudents(batchId: string): Promise<any> {
    return MobileApiService.request(`/batches/${batchId}/students`);
  }

  static async getAttendanceForBatch(batchId: string, date: string): Promise<any> {
    return MobileApiService.request(`/attendance?batchId=${batchId}&date=${date}`);
  }
}
