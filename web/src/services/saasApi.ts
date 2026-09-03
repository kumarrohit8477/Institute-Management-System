import ApiService from "@/src/services/api";

export interface SaasKPIs {
  totalInstitutes: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalStudents: number;
  totalCourses: number;
  totalUsers: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalLifetimeRevenue: number;
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
  _count?: { subscriptions: number };
}

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
    plan: SubscriptionPlanItem;
  };
  tenantUsage?: {
    studentCount: number;
    courseCount: number;
    batchCount: number;
    storageUsedMB: number;
    testsCreatedThisMonth: number;
  };
  _count?: {
    students: number;
    courses: number;
    batches: number;
    users: number;
  };
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
  paymentGatewayTxId?: string | null;
  createdAt: string;
  institute?: {
    id: string;
    name: string;
    code: string;
    email: string;
  };
  subscription?: {
    plan?: SubscriptionPlanItem;
  };
}

export class SaasApi {
  static async getPlatformOverview(): Promise<{
    kpis: SaasKPIs;
    recentInstitutes: InstituteTenantItem[];
    recentInvoices: PlatformInvoiceItem[];
  }> {
    return ApiService.request("/saas/overview");
  }

  static async getInstitutes(params: {
    status?: string;
    planTier?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ institutes: InstituteTenantItem[]; meta: any }> {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.planTier) query.append("planTier", params.planTier);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const response = await ApiService.request(`/saas/institutes?${query.toString()}`);
    // ApiService handles unwrapping data
    if (Array.isArray(response)) {
      return { institutes: response, meta: {} };
    }
    return response;
  }

  static async getInstituteById(id: string): Promise<InstituteTenantItem> {
    return ApiService.request(`/saas/institutes/${id}`);
  }

  static async onboardInstitute(payload: {
    name: string;
    code: string;
    customDomain?: string;
    email: string;
    phone: string;
    address?: string;
    adminEmail: string;
    adminPassword: string;
    planTier: string;
    billingCycle: string;
  }): Promise<any> {
    return ApiService.request("/saas/institutes", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  static async updateInstituteStatus(id: string, status: string): Promise<any> {
    return ApiService.request(`/saas/institutes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }

  static async changeInstituteSubscription(id: string, payload: {
    planTier: string;
    billingCycle: string;
    autoRenew?: boolean;
  }): Promise<any> {
    return ApiService.request(`/saas/institutes/${id}/subscription`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  static async getSubscriptionPlans(): Promise<SubscriptionPlanItem[]> {
    return ApiService.request("/saas/plans");
  }

  static async updateSubscriptionPlan(id: string, payload: Partial<SubscriptionPlanItem>): Promise<any> {
    return ApiService.request(`/saas/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }

  static async getPlatformInvoices(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ invoices: PlatformInvoiceItem[]; meta: any }> {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const response = await ApiService.request(`/saas/invoices?${query.toString()}`);
    if (Array.isArray(response)) {
      return { invoices: response, meta: {} };
    }
    return response;
  }

  static async recordInvoicePayment(id: string, payload: {
    paymentMethod?: string;
    transactionReference?: string;
  }): Promise<any> {
    return ApiService.request(`/saas/invoices/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
}
