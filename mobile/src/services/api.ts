import { Platform } from "react-native";
import Constants from "expo-constants";
import { StorageService } from "./storage";

declare const process: any;

let customApiUrl: string | null = null;

export const getAutoDetectedHostIp = (): string | null => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        return ip;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
};

export const getApiBaseUrl = async (): Promise<string> => {
  if (customApiUrl) return customApiUrl;

  const stored = await StorageService.getItem("ims_custom_api_url");
  if (stored && stored.trim()) {
    customApiUrl = stored.trim();
    return customApiUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const lanIp = getAutoDetectedHostIp();
  if (lanIp) {
    return `http://${lanIp}:5000/api/v1`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }

  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname || "localhost";
    return `http://${hostname}:5000/api/v1`;
  }

  return "http://localhost:5000/api/v1";
};

export const setCustomApiBaseUrl = async (url: string | null): Promise<void> => {
  customApiUrl = url;
  if (url) {
    await StorageService.setItem("ims_custom_api_url", url);
  } else {
    await StorageService.removeItem("ims_custom_api_url");
  }
};

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
    const baseUrl = await getApiBaseUrl();

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    };

    if (requiresAuth && accessToken) {
      requestHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        ...rest,
      });

      // Handle 401 Unauthorized — Attempt token refresh
      if (response.status === 401 && requiresAuth && !endpoint.includes("/auth/")) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshToken = await StorageService.getItem("ims_mobile_refresh_token");
            if (!refreshToken) throw new Error("No refresh token available");

            const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
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
              ...rest,
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
                  ...rest,
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
      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data.data !== undefined ? data.data : data;
    } catch (err: any) {
      if (
        err.message === "Network request failed" ||
        err.name === "TypeError" ||
        err.name === "SyntaxError" ||
        err.message?.includes("Network")
      ) {
        throw new Error(`Cannot connect to server at ${baseUrl}. Tap the gear ⚙️ icon to check or change backend IP.`);
      }
      throw err;
    }
  }
}
