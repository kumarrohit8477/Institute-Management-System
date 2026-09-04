import { MobileApiService } from "./api";

export interface ExamQuestionOption {
  id: string;
  optionText: string;
  sortOrder: number;
  isCorrect?: boolean;
}

export interface ExamQuestion {
  id: string;
  questionId: string;
  sectionName?: string | null;
  sortOrder: number;
  marks: number;
  negativeMarks: number;
  question: {
    id: string;
    subjectId: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "NUMERICAL" | "TRUE_FALSE" | "SUBJECTIVE";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionText: string;
    explanation?: string | null;
    options: ExamQuestionOption[];
  };
}

export interface AvailableTestItem {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  status: string;
  batch?: { id: string; name: string; code: string } | null;
  subject?: { id: string; name: string; code: string } | null;
  myAttempt?: {
    id: string;
    status: "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "ABANDONED";
    score: number;
    startedAt: string;
    submittedAt?: string;
  } | null;
}

export interface StartAttemptResponse {
  attempt: {
    id: string;
    startedAt: string;
    status: string;
    totalAllowedSeconds: number;
    remainingSeconds: number;
    savedAnswers: Array<{
      questionId: string;
      selectedOptionIds?: string[] | null;
      textAnswer?: string | null;
      timeSpentSeconds: number;
    }>;
  };
  test: {
    id: string;
    title: string;
    description?: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    questions: ExamQuestion[];
  };
}

export interface TestResultData {
  id: string;
  totalMarksObtained: number;
  percentage: number;
  percentile?: number | null;
  rank?: number | null;
  isPassed: boolean;
  remarks?: string | null;
  student: { id: string; firstName: string; lastName: string; admissionNumber: string };
  test: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
  };
  attempt: {
    id: string;
    startedAt: string;
    submittedAt?: string;
    score: number;
    totalAttempted: number;
    totalCorrect: number;
    totalIncorrect: number;
    studentAnswers: Array<{
      id: string;
      questionId: string;
      selectedOptionIds?: string[] | null;
      textAnswer?: string | null;
      isCorrect?: boolean | null;
      marksAwarded: number;
      question: {
        id: string;
        type: string;
        questionText: string;
        explanation?: string | null;
        options: ExamQuestionOption[];
      };
    }>;
  };
}

export class MobileExamService {
  static async getTests(params?: { status?: string }): Promise<AvailableTestItem[]> {
    const query = params?.status ? `?status=${params.status}` : "";
    return MobileApiService.request<AvailableTestItem[]>(`/tests${query}`);
  }

  static async startAttempt(testId: string): Promise<StartAttemptResponse> {
    return MobileApiService.request<StartAttemptResponse>(`/tests/${testId}/start`, { method: "POST" });
  }

  static async saveAnswer(testId: string, data: { questionId: string; selectedOptionIds?: string[]; textAnswer?: string; timeSpentSeconds?: number }): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/save-answer`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  static async submitAttempt(testId: string): Promise<any> {
    return MobileApiService.request(`/tests/${testId}/submit`, { method: "POST" });
  }

  static async getResult(testId: string): Promise<TestResultData> {
    return MobileApiService.request<TestResultData>(`/tests/${testId}/my-result`);
  }

  static async getMyResults(): Promise<any[]> {
    return MobileApiService.request<any[]>("/results/my");
  }
}
