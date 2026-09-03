import ApiService from "@/src/services/api";

export interface AdminStudent {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string;
  status: string;
  batch?: { id: string; name: string; code: string } | null;
  createdAt: string;
}

export interface AdminSubject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status?: string;
  courseId?: string;
  course?: { id: string; name: string; code: string };
}

export interface AdminTeacher {
  id: string;
  instituteId?: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string | null;
  qualification?: string | null;
  specialization?: string | null;
  experienceYears?: number | string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE" | "RESIGNED" | string;
  joiningDate?: string | null;
  createdAt?: string;
  subjects?: {
    id?: string;
    subjectId?: string;
    subject?: {
      id: string;
      name: string;
      code: string;
      course?: { id?: string; name?: string; code?: string };
    };
  }[];
  assignments?: {
    id?: string;
    batch?: { id: string; name: string; code: string; status?: string };
    subject?: { id: string; name: string; code: string };
    course?: { id: string; name: string; code: string };
  }[];
}

export interface AdminCourse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  durationMonths: number;
  status: string;
  createdAt?: string;
  subjects?: AdminSubject[];
  batches?: AdminBatch[];
  _count?: { subjects: number; batches: number };
}

export interface AdminBatch {
  id: string;
  name: string;
  code: string;
  courseId: string;
  course?: { id: string; name: string; code: string };
  startDate: string;
  endDate?: string | null;
  status: string;
  maxStrength?: number;
  maxCapacity?: number;
  createdAt?: string;
  _count?: { students: number; teacherAssignments?: number };
  students?: {
    id: string;
    studentId: string;
    rollNumber?: string | null;
    student: {
      id: string;
      admissionNumber: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      status: string;
    };
  }[];
  teacherAssignments?: {
    id: string;
    teacher: { id: string; firstName: string; lastName: string; employeeCode?: string };
    subject: { id: string; name: string; code: string };
  }[];
}

export interface AdminTimetableSlot {
  id: string;
  batchId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string | null;
  meetingLink?: string | null;
  batch?: { name: string };
  subject?: { name: string };
  teacher?: { firstName: string; lastName: string };
}

export interface AdminMaterial {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  batchId: string;
  subjectId: string;
  batch?: { name: string };
  subject?: { name: string };
  createdAt: string;
}

export class AdminApiService {
  // Students
  static async getStudents(): Promise<AdminStudent[]> {
    const res = await ApiService.request<any>("/students");
    return Array.isArray(res) ? res : res.students || [];
  }

  static async createStudent(data: any): Promise<any> {
    return ApiService.request("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Teachers
  static async getTeachers(params?: { search?: string; status?: string; specialization?: string }): Promise<AdminTeacher[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.specialization) query.append("specialization", params.specialization);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/teachers${queryString}`);
    return Array.isArray(res) ? res : res.teachers || [];
  }

  static async getTeacherById(id: string): Promise<AdminTeacher> {
    return ApiService.request<AdminTeacher>(`/teachers/${id}`);
  }

  static async createTeacher(data: any): Promise<AdminTeacher> {
    return ApiService.request("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTeacher(id: string, data: Partial<AdminTeacher>): Promise<AdminTeacher> {
    return ApiService.request(`/teachers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteTeacher(id: string): Promise<any> {
    return ApiService.request(`/teachers/${id}`, {
      method: "DELETE",
    });
  }

  static async assignTeacherSubject(teacherId: string, subjectId: string): Promise<any> {
    return ApiService.request(`/teachers/${teacherId}/subjects`, {
      method: "POST",
      body: JSON.stringify({ subjectId }),
    });
  }

  static async removeTeacherSubject(teacherId: string, subjectId: string): Promise<any> {
    return ApiService.request(`/teachers/${teacherId}/subjects/${subjectId}`, {
      method: "DELETE",
    });
  }

  // Subjects
  static async getSubjects(params?: { courseId?: string; search?: string; status?: string }): Promise<AdminSubject[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/subjects${queryString}`);
    return Array.isArray(res) ? res : res.subjects || [];
  }

  static async getSubjectById(id: string): Promise<AdminSubject> {
    return ApiService.request<AdminSubject>(`/subjects/${id}`);
  }

  static async createSubject(data: { courseId: string; name: string; code: string; description?: string }): Promise<AdminSubject> {
    return ApiService.request("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateSubject(id: string, data: Partial<AdminSubject>): Promise<AdminSubject> {
    return ApiService.request(`/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteSubject(id: string): Promise<any> {
    return ApiService.request(`/subjects/${id}`, {
      method: "DELETE",
    });
  }

  // Courses
  static async getCourses(params?: { search?: string; status?: string }): Promise<AdminCourse[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/courses${queryString}`);
    return Array.isArray(res) ? res : res.courses || [];
  }

  static async getCourseById(id: string): Promise<AdminCourse> {
    return ApiService.request<AdminCourse>(`/courses/${id}`);
  }

  static async createCourse(data: any): Promise<AdminCourse> {
    return ApiService.request("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateCourse(id: string, data: Partial<AdminCourse>): Promise<AdminCourse> {
    return ApiService.request(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteCourse(id: string): Promise<any> {
    return ApiService.request(`/courses/${id}`, {
      method: "DELETE",
    });
  }

  // Batches
  static async getBatches(params?: { courseId?: string; search?: string; status?: string }): Promise<AdminBatch[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/batches${queryString}`);
    return Array.isArray(res) ? res : res.batches || [];
  }

  static async getBatchById(id: string): Promise<AdminBatch> {
    return ApiService.request<AdminBatch>(`/batches/${id}`);
  }

  static async createBatch(data: any): Promise<AdminBatch> {
    return ApiService.request("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateBatch(id: string, data: Partial<AdminBatch>): Promise<AdminBatch> {
    return ApiService.request(`/batches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteBatch(id: string): Promise<any> {
    return ApiService.request(`/batches/${id}`, {
      method: "DELETE",
    });
  }

  static async assignStudentToBatch(batchId: string, studentId: string, rollNumber?: string): Promise<any> {
    return ApiService.request(`/batches/${batchId}/students`, {
      method: "POST",
      body: JSON.stringify({ studentId, rollNumber }),
    });
  }

  static async removeStudentFromBatch(batchId: string, studentId: string): Promise<any> {
    return ApiService.request(`/batches/${batchId}/students/${studentId}`, {
      method: "DELETE",
    });
  }

  static async getBatchStudents(batchId: string): Promise<any> {
    return ApiService.request(`/batches/${batchId}/students`);
  }

  // Timetables
  static async getTimetables(): Promise<AdminTimetableSlot[]> {
    const res = await ApiService.request<any>("/timetables");
    return Array.isArray(res) ? res : res.timetables || [];
  }

  static async createTimetableSlot(data: any): Promise<any> {
    return ApiService.request("/timetables", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Study Materials
  static async getMaterials(): Promise<AdminMaterial[]> {
    const res = await ApiService.request<any>("/materials");
    return Array.isArray(res) ? res : res.materials || [];
  }

  static async createMaterial(data: any): Promise<any> {
    return ApiService.request("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
