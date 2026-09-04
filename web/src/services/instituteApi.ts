import ApiService from "@/src/services/api";

const API_BASE_URL = "http://localhost:5000/api/v1";
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  tier: string;
  description?: string | null;
  monthlyPrice: number | string;
  annualPrice: number | string;
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

export interface SubscriptionDetails {
  id: string;
  instituteId: string;
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string;
  trialEndsAt?: string | null;
  autoRenew: boolean;
  cancelledAt?: string | null;
  plan?: SubscriptionPlanDetails;
}

export interface TenantUsageDetails {
  id: string;
  instituteId: string;
  studentCount: number;
  courseCount: number;
  batchCount: number;
  storageUsedMB: number | string;
  testsCreatedThisMonth: number;
  updatedAt: string;
}

export interface InstituteCountDetails {
  students: number;
  teachers: number;
  courses: number;
  batches: number;
  rooms: number;
  users: number;
}

export interface InstituteDetails {
  id: string;
  name: string;
  code: string;
  tagline?: string | null;
  customDomain?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  status: string;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
  subscription?: SubscriptionDetails | null;
  tenantUsage?: TenantUsageDetails | null;
  _count?: InstituteCountDetails;
}

export interface UpdateInstituteProfileInput {
  name?: string;
  phone?: string;
  address?: string | null;
  website?: string | null;
  tagline?: string | null;
}

export interface UpdateLogoResponse {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  tagline?: string | null;
  updatedAt: string;
}

export class InstituteApiService {
  /**
   * Helper to resolve relative /uploads logo paths to absolute backend URL
   */
  static getLogoFullUrl(logoUrl?: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://") || logoUrl.startsWith("data:")) {
      return logoUrl;
    }
    const cleanPath = logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`;
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }

  /**
   * Fetch current institute details
   */
  static async getCurrentInstitute(): Promise<InstituteDetails> {
    return ApiService.request<InstituteDetails>("/institute/current");
  }

  /**
   * Upload or change institute logo
   */
  static async uploadLogo(
    logoData: string,
    fileName?: string,
    mimeType?: string
  ): Promise<UpdateLogoResponse> {
    return ApiService.request<UpdateLogoResponse>("/institute/logo", {
      method: "POST",
      body: JSON.stringify({ logoData, fileName, mimeType })
    });
  }

  /**
   * Remove institute logo
   */
  static async deleteLogo(): Promise<UpdateLogoResponse> {
    return ApiService.request<UpdateLogoResponse>("/institute/logo", {
      method: "DELETE"
    });
  }

  /**
   * Update or clear institute tagline / slogan
   */
  static async updateTagline(tagline: string | null): Promise<UpdateLogoResponse> {
    return ApiService.request<UpdateLogoResponse>("/institute/tagline", {
      method: "PUT",
      body: JSON.stringify({ tagline })
    });
  }

  /**
   * Update institute profile information
   */
  static async updateProfile(data: UpdateInstituteProfileInput): Promise<InstituteDetails> {
    return ApiService.request<InstituteDetails>("/institute/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
}
