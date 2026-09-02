// Storage abstraction for Mobile Environment (AsyncStorage / SecureStore compatible)

const memoryStore: Record<string, string> = {};

export class StorageService {
  static async getItem(key: string): Promise<string | null> {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return memoryStore[key] || null;
  }

  static async setItem(key: string, value: string): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  }

  static async removeItem(key: string): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    } else {
      delete memoryStore[key];
    }
  }

  static async clear(): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    } else {
      Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
    }
  }
}
