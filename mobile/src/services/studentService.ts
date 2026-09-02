import { MobileApiService } from "./api";

export class MobileStudentService {
  static async getAcademics(): Promise<any> {
    return MobileApiService.request("/students/my/academics");
  }

  static async getSchedule(): Promise<any> {
    return MobileApiService.request("/timetable/my");
  }

  static async getMaterials(params?: { subjectId?: string; search?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return MobileApiService.request(`/materials/my${query ? `?${query}` : ""}`);
  }

  static async getAttendance(): Promise<any> {
    return MobileApiService.request("/attendance/my");
  }
}
