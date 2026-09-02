import { MobileApiService } from "./api";
import { StorageService } from "./storage";

export interface MobileLoginCredentials {
  email: string;
  password: string;
  instituteCode?: string;
}

export interface MobileAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "STUDENT";
    organizationId?: string | null;
    status: string;
  };
  institute?: {
    id: string;
    name: string;
    code: string;
    logoUrl?: string | null;
  } | null;
  student?: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  } | null;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export class MobileAuthService {
  static async login(credentials: MobileLoginCredentials): Promise<MobileAuthResponse> {
    const data = await MobileApiService.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      requiresAuth: false
    });

    const accessToken = data.tokens?.accessToken || data.accessToken || data.token;
    const refreshToken = data.tokens?.refreshToken || data.refreshToken;

    if (!data.user) {
      throw new Error("Invalid response from authentication server");
    }

    // Ensure only students authenticate into the student mobile application
    if (data.user.role !== "STUDENT") {
      throw new Error(
        `Access Restricted: This mobile app is exclusively designed for students. (${data.user.role} accounts should use the Web Admin Portal).`
      );
    }

    await StorageService.setItem("ims_mobile_access_token", accessToken);
    await StorageService.setItem("ims_mobile_refresh_token", refreshToken);
    await StorageService.setItem("ims_mobile_user", JSON.stringify(data.user));
    if (data.institute) {
      await StorageService.setItem("ims_mobile_institute", JSON.stringify(data.institute));
    }
    if (data.student) {
      await StorageService.setItem("ims_mobile_student", JSON.stringify(data.student));
    }

    return {
      ...data,
      accessToken,
      refreshToken
    };
  }

  static async getMe(): Promise<{ user: any; institute: any; student: any }> {
    return MobileApiService.request("/auth/me");
  }

  static async logout(): Promise<void> {
    try {
      const refreshToken = await StorageService.getItem("ims_mobile_refresh_token");
      if (refreshToken) {
        await MobileApiService.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      await StorageService.clear();
    }
  }
}
