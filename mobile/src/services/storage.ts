import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryStore: Record<string, string> = {};

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
};

export class StorageService {
  static async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      } catch {
        // Fallback
      }
    }
    try {
      const val = await withTimeout(AsyncStorage.getItem(key), 500, null);
      if (val !== null) return val;
    } catch {
      // Fallback
    }
    return memoryStore[key] || null;
  }

  static async setItem(key: string, value: string): Promise<void> {
    memoryStore[key] = value;
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Fallback
      }
    }
    try {
      await withTimeout(AsyncStorage.setItem(key, value), 500, undefined);
    } catch {
      // Fallback in memory
    }
  }

  static async removeItem(key: string): Promise<void> {
    delete memoryStore[key];
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    try {
      await withTimeout(AsyncStorage.removeItem(key), 500, undefined);
    } catch {
      // Fallback in memory
    }
  }

  static async clear(): Promise<void> {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        // Fallback
      }
    }
    try {
      await withTimeout(AsyncStorage.clear(), 500, undefined);
    } catch {
      // Fallback in memory
    }
  }
}
