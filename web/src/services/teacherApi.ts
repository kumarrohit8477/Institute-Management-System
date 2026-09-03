import ApiService from "@/src/services/api";
import { AdminBatch, AdminBatchSubject, AdminTimetableSlot } from "./adminApi";

export interface TeacherAcademicScope {
  teacher: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    skills?: string;
  };
  assignedBatches: AdminBatch[];
  batchSubjects: AdminBatchSubject[];
  timetables: AdminTimetableSlot[];
}

export class TeacherApiService {
  /**
   * Fetch academic assignments, batches, subjects, and timetable for logged-in teacher
   */
  static async getMyAcademicScope(): Promise<TeacherAcademicScope> {
    const res = await ApiService.request<any>("/teacher-portal/academic-scope");
    return res.data || res;
  }

  /**
   * Update progress percentage or completion notes for assigned batch subject
   */
  static async updateSubjectProgress(
    batchSubjectId: string,
    data: { progress?: number; status?: string; notes?: string }
  ): Promise<any> {
    const res = await ApiService.request<any>(`/teacher-portal/batch-subjects/${batchSubjectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data || res;
  }
}
