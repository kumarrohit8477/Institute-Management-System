import { MobileApiService } from "./api";

export class MobileSuperAdminService {
  static async getDashboard(): Promise<any> {
    return MobileApiService.request("/saas/overview").catch(() => ({
      totalInstitutes: 0,
      activeInstitutes: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
    }));
  }

  static async getInstitutes(params?: {
    search?: string;
    status?: string;
    page?: number;
  }): Promise<any> {
    const q = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      page: String(params?.page || 1),
      limit: "20",
    }).toString();
    return MobileApiService.request(`/institutes?${q}`);
  }

  static async getPlans(): Promise<any> {
    return MobileApiService.request("/saas/plans");
  }

  static async getInvoices(params?: { page?: number }): Promise<any> {
    return MobileApiService.request(
      `/saas/invoices?page=${params?.page || 1}&limit=20`
    );
  }

  static async updateInstituteStatus(id: string, status: string): Promise<any> {
    return MobileApiService.request(`/institutes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
}
