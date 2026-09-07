import { MobileApiService } from "./api";

export interface InstituteTenantItem {
  id: string;
  name: string;
  code: string;
  customDomain?: string | null;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL" | "ARCHIVED";
  createdAt: string;
  subscription?: {
    id: string;
    billingCycle: "MONTHLY" | "QUARTERLY" | "ANNUAL";
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
    startDate: string;
    endDate: string;
    plan?: { name: string };
  };
  tenantUsage?: {
    studentCount: number;
    courseCount: number;
    batchCount: number;
  };
  _count?: {
    students: number;
    courses: number;
    batches: number;
    users: number;
  };
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  tier: "FREE_TRIAL" | "STARTER" | "GROWTH" | "ENTERPRISE";
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  maxStudents: number;
  maxCourses: number;
  maxBatches: number;
  maxStorageMB: number;
  hasOnlineCBT: boolean;
  hasCustomDomain: boolean;
  hasPushNotifications: boolean;
  hasApiAccess: boolean;
  isActive: boolean;
}

export interface PlatformInvoiceItem {
  id: string;
  invoiceNumber: string;
  instituteId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  dueDate: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  institute?: {
    name: string;
    code: string;
    email: string;
  };
}

export class MobileSuperAdminService {
  static async getDashboard(): Promise<any> {
    const res = await MobileApiService.request<any>("/saas/overview").catch(() => null);
    if (!res) {
      return {
        totalInstitutes: 0,
        activeInstitutes: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        recentInstitutes: [],
      };
    }
    const kpis = res.kpis || {};
    return {
      totalInstitutes: kpis.totalInstitutes || (res.recentInstitutes?.length ?? 0),
      activeInstitutes: kpis.activeTenants || 0,
      totalRevenue: kpis.totalLifetimeRevenue || 0,
      monthlyRevenue: kpis.monthlyRecurringRevenue || 0,
      recentInstitutes: res.recentInstitutes || [],
      recentInvoices: res.recentInvoices || [],
    };
  }

  static async getInstitutes(params?: {
    search?: string;
    status?: string;
    page?: number;
  }): Promise<{ institutes: InstituteTenantItem[]; meta?: any }> {
    const q = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      page: String(params?.page || 1),
      limit: "20",
    }).toString();
    const res = await MobileApiService.request<any>(`/saas/institutes?${q}`);
    if (Array.isArray(res)) {
      return { institutes: res };
    }
    return { institutes: res.institutes || [], meta: res.meta };
  }

  static async onboardInstitute(payload: {
    name: string;
    code: string;
    customDomain?: string;
    email: string;
    phone: string;
    adminEmail: string;
    adminPassword: string;
    planTier: string;
    billingCycle?: string;
  }): Promise<any> {
    return MobileApiService.request("/saas/institutes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async updateInstituteStatus(id: string, status: string): Promise<any> {
    return MobileApiService.request(`/saas/institutes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  static async getPlans(): Promise<SubscriptionPlanItem[]> {
    const res = await MobileApiService.request<any>("/saas/plans");
    return Array.isArray(res) ? res : res.plans || [];
  }

  static async updatePlan(id: string, payload: Partial<SubscriptionPlanItem>): Promise<any> {
    return MobileApiService.request(`/saas/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  static async getInvoices(params?: { status?: string; page?: number }): Promise<{ invoices: PlatformInvoiceItem[] }> {
    const q = new URLSearchParams({
      ...(params?.status ? { status: params.status } : {}),
      page: String(params?.page || 1),
      limit: "20",
    }).toString();
    const res = await MobileApiService.request<any>(`/saas/invoices?${q}`);
    if (Array.isArray(res)) {
      return { invoices: res };
    }
    return { invoices: res.invoices || [] };
  }

  static async recordInvoicePayment(id: string, payload: { paymentMethod?: string; transactionReference?: string }): Promise<any> {
    return MobileApiService.request(`/saas/invoices/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
