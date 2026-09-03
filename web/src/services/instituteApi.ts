import ApiService from "@/src/services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export interface InstituteDetails {
  id: string;
  name: string;
  code: string;
  customDomain?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  status: string;
  settings?: any;
}

export interface UpdateLogoResponse {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
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
}
