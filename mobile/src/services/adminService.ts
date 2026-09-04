import { MobileApiService } from "./api";

export class MobileAdminService {
  static async getStudents(params?: { search?: string; page?: number; status?: string }): Promise<any> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      page: String(params?.page || 1),
      limit: "20",
    }).toString();
    return MobileApiService.request(`/students?${query}`);
  }

  static async getTeachers(params?: { search?: string }): Promise<any> {
    const q = params?.search ? `?search=${params.search}` : "";
    return MobileApiService.request(`/teachers${q}`);
  }

  static async getCourses(): Promise<any> {
    return MobileApiService.request("/courses");
  }

  static async getBatches(params?: { search?: string; status?: string }): Promise<any> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    }).toString();
    return MobileApiService.request(`/batches?${query}`);
  }

  static async getFees(params?: { page?: number }): Promise<any> {
    return MobileApiService.request(`/fees?page=${params?.page || 1}&limit=20`);
  }

  static async getAttendanceReport(params?: {
    batchId?: string;
    date?: string;
  }): Promise<any> {
    const q = new URLSearchParams(params as any).toString();
    return MobileApiService.request(`/attendance?${q}`);
  }

  static async getInstituteInfo(): Promise<any> {
    return MobileApiService.request("/institute");
  }

  static async getDashboardStats(): Promise<any> {
    return Promise.allSettled([
      MobileApiService.request("/students?limit=1"),
      MobileApiService.request("/teachers?limit=1"),
      MobileApiService.request("/courses?limit=1"),
      MobileApiService.request("/batches?limit=1"),
    ]).then((results) => ({
      students: results[0].status === "fulfilled" ? (results[0].value as any)?.total || 0 : 0,
      teachers: results[1].status === "fulfilled" ? (results[1].value as any)?.total || 0 : 0,
      courses: results[2].status === "fulfilled" ? (results[2].value as any)?.total || 0 : 0,
      batches: results[3].status === "fulfilled" ? (results[3].value as any)?.total || 0 : 0,
    }));
  }

  static async getStats(): Promise<any> {
    return this.getDashboardStats();
  }
}
