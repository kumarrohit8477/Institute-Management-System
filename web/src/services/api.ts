import { AuthResponse, LoginCredentials } from "@/src/types/auth.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

class ApiService {
  private static getAccessToken(): string | null {
    return localStorage.getItem("ims_access_token");
  }

  private static getRefreshToken(): string | null {
    return localStorage.getItem("ims_refresh_token");
  }

  private static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("ims_access_token", accessToken);
    localStorage.setItem("ims_refresh_token", refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem("ims_access_token");
    localStorage.removeItem("ims_refresh_token");
    localStorage.removeItem("ims_user_profile");
  }

  /**
   * Core request wrapper with authorization header and error parsing
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure: boolean = true
  ): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized by attempting token refresh
      if (response.status === 401 && retryOnAuthFailure) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request once with new token
          return this.request<T>(endpoint, options, false);
        } else {
          this.clearTokens();
          window.dispatchEvent(new Event("ims_auth_unauthorized"));
          throw new Error("Session expired. Please log in again.");
        }
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorMessage =
          data.message || data.error?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      throw new Error(error.message || "Network request error");
    }
  }

  /**
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });

    if (data.tokens) {
      this.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      localStorage.setItem("ims_user_profile", JSON.stringify(data));
    }

    return data;
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" }, false);
    } catch {
      // Ignore network errors during logout
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Fetch current authenticated user
   */
  static async getMe(): Promise<any> {
    return this.request("/auth/me");
  }
}

export default ApiService;
