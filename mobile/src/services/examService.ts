import { MobileApiService } from "./api";

export class MobileExamService {
  static async getTests(): Promise<any[]> {
    return MobileApiService.request<any[]>("/tests");
  }

  static async startAttempt(testId: string): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/start`, { method: "POST" });
  }

  static async saveAnswer(testId: string, data: { questionId: string; selectedOptionIds?: string[]; textAnswer?: string }): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/save-answer`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  static async submitAttempt(testId: string): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/submit`, { method: "POST" });
  }

  static async getResult(testId: string): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/my-result`);
  }

  static async getMyResults(): Promise<any[]> {
    return MobileApiService.request("/results/my");
  }
}
