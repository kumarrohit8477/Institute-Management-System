import ApiService from "./api";

export interface StudentAcademics {
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    status: string;
    admissionDate?: string;
  };
  institute: {
    id: string;
    name: string;
    code: string;
    logoUrl?: string | null;
  };
  batches: Array<{
    id: string;
    name: string;
    code: string;
    rollNumber?: string;
    enrolledAt: string;
    startDate: string;
    endDate?: string;
    status: string;
    courseName: string;
    courseCode: string;
  }>;
  courses: Array<{
    id: string;
    name: string;
    code: string;
    description?: string;
    durationMonths?: number;
    status: string;
  }>;
  subjects: Array<{
    id: string;
    courseId: string;
    courseName: string;
    name: string;
    code: string;
    description?: string;
    teachers: Array<{
      id: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
      email: string;
      specialization?: string;
    }>;
  }>;
  teachers: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    qualification?: string;
    specialization?: string;
    experienceYears?: number;
    avatarUrl?: string;
    subjectName?: string;
    batchName?: string;
  }>;
}

export interface StudentScheduleResponse {
  student: { id: string; admissionNumber: string; name: string };
  enrolledBatches: Array<{ id: string; name: string; code: string }>;
  scheduleByDay: Record<
    string,
    Array<{
      id: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      roomNumber?: string;
      meetingLink?: string;
      classType: string;
      status: string;
      batch: { id: string; name: string; code: string };
      subject: { id: string; name: string; code: string };
      teacher: { id: string; firstName: string; lastName: string };
    }>
  >;
  allSlots: any[];
}

export interface StudentMaterialsResponse {
  student: { id: string; name: string };
  enrolledBatches: Array<{ id: string; name: string; code: string }>;
  materials: Array<{
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: "PDF" | "DOC" | "VIDEO" | "LINK" | "IMAGE" | "OTHER";
    fileSizeBytes?: string;
    createdAt: string;
    course: { id: string; name: string; code: string };
    subject: { id: string; name: string; code: string };
    batch?: { id: string; name: string; code: string } | null;
  }>;
}

export interface StudentAttendanceResponse {
  student: { id: string; admissionNumber: string; name: string };
  statistics: {
    totalDays: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    excusedCount: number;
    attendancePercentage: number;
  };
  enrolledBatches: Array<{ id: string; name: string; code: string }>;
  records: Array<{
    id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string;
    batch: { id: string; name: string; code: string };
  }>;
}

export class StudentApiService {
  /**
   * Fetch complete academic summary (courses, batches, subjects, teachers)
   */
  static async getMyAcademics(): Promise<StudentAcademics> {
    return ApiService.request<StudentAcademics>("/students/my/academics");
  }

  /**
   * Fetch personal weekly class schedule
   */
  static async getMySchedule(): Promise<StudentScheduleResponse> {
    return ApiService.request<StudentScheduleResponse>("/timetable/my");
  }

  /**
   * Fetch enrolled study materials
   */
  static async getMyMaterials(params?: { subjectId?: string; fileType?: string; search?: string }): Promise<StudentMaterialsResponse> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.request<StudentMaterialsResponse>(`/materials/my${query ? `?${query}` : ""}`);
  }

  /**
   * Fetch personal attendance profile
   */
  static async getMyAttendance(params?: { startDate?: string; endDate?: string }): Promise<StudentAttendanceResponse> {
    const query = new URLSearchParams(params as any).toString();
    return ApiService.request<StudentAttendanceResponse>(`/attendance/my${query ? `?${query}` : ""}`);
  }
}
