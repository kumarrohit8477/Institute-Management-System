import { StorageService } from "./storage";
const API_BASE_URL = "http://localhost:5000/api/v1";
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}
export class MobileApiService {
  private static isRefreshing = false;
  private static refreshSubscribers: ((token: string) => void)[] = [];

  private static subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private static onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...rest } = options;

    let accessToken = await StorageService.getItem("ims_mobile_access_token");

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>)
    };

    if (requiresAuth && accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        ...rest
      });

      // Handle 401 Unauthorized — Attempt token refresh
      if (response.status === 401 && requiresAuth && !endpoint.includes("/auth/")) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshToken = await StorageService.getItem("ims_mobile_refresh_token");
            if (!refreshToken) throw new Error("No refresh token available");

            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken })
            });

            if (!refreshResponse.ok) {
              throw new Error("Token refresh failed");
            }

            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.data?.accessToken;
            await StorageService.setItem("ims_mobile_access_token", newAccessToken);

            this.isRefreshing = false;
            this.onRefreshed(newAccessToken);

            requestHeaders["Authorization"] = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(url, {
              headers: requestHeaders,
              ...rest
            });

            const retryData = await retryResponse.json();
            return retryData.data !== undefined ? retryData.data : retryData;
          } catch (refreshErr) {
            this.isRefreshing = false;
            await StorageService.clear();
            throw new Error("Session expired. Please log in again.");
          }
        } else {
          // Queue request until refresh completes
          return new Promise<T>((resolve, reject) => {
            this.subscribeTokenRefresh(async (newToken) => {
              try {
                requestHeaders["Authorization"] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, {
                  headers: requestHeaders,
                  ...rest
                });
                const retryData = await retryResponse.json();
                resolve(retryData.data !== undefined ? retryData.data : retryData);
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data.data !== undefined ? data.data : data;
    } catch (err: any) {
      throw err;
    }
  }
}
