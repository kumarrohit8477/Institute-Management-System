import ApiService from "@/src/services/api";

export interface AdminStudentBatchEnrollment {
  id: string;
  studentId: string;
  batchId: string;
  rollNumber?: string | null;
  status: string;
  enrolledAt: string;
  batch: {
    id: string;
    name: string;
    code: string;
    courseId: string;
    maxStrength?: number;
    course?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

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
  batches?: AdminStudentBatchEnrollment[];
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

export interface AdminRoom {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: "CLASSROOM" | "LAB" | "ONLINE" | "OTHER";
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  _count?: { timetables: number };
}

export interface AdminCourseSubject {
  id: string;
  courseId: string;
  subjectId: string;
  displayOrder: number;
  estimatedDuration?: string | null;
  subject: AdminSubject;
}

export interface AdminBatchSubject {
  id: string;
  batchId: string;
  subjectId: string;
  assignedTeacherId?: string | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress: number;
  notes?: string | null;
  subject: AdminSubject;
  assignedTeacher?: AdminTeacher | null;
}

export interface AdminCourse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  duration?: number;
  durationUnit?: string;
  durationMonths?: number;
  totalFees?: number | string;
  status: string;
  createdAt?: string;
  subjects?: AdminSubject[];
  courseSubjects?: AdminCourseSubject[];
  batches?: AdminBatch[];
  _count?: { subjects: number; courseSubjects?: number; batches: number };
}

export interface AdminBatch {
  id: string;
  name: string;
  code: string;
  academicSession?: string | null;
  description?: string | null;
  courseId: string;
  course?: { id: string; name: string; code: string };
  startDate: string;
  endDate?: string | null;
  status: string;
  maxStrength?: number;
  maxCapacity?: number;
  createdAt?: string;
  _count?: { students: number; batchSubjects?: number; timetables?: number; teacherAssignments?: number };
  batchSubjects?: AdminBatchSubject[];
  timetables?: AdminTimetableSlot[];
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
  roomId?: string | null;
  batchSubjectId?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber?: string | null;
  meetingLink?: string | null;
  batch?: { id?: string; name: string; code?: string };
  subject?: { id?: string; name: string; code?: string };
  teacher?: { id?: string; firstName: string; lastName: string; employeeCode?: string };
  room?: { id?: string; name: string; code?: string; capacity?: number };
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
  static async getStudents(params?: { search?: string; status?: string; batchId?: string; courseId?: string; page?: number; limit?: number }): Promise<AdminStudent[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.batchId) query.append("batchId", params.batchId);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/students${queryString}`);
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

  static async createBatchWizard(data: any): Promise<AdminBatch> {
    return ApiService.request("/batches/wizard", {
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

  static async updateBatchStatus(id: string, status: string): Promise<AdminBatch> {
    return ApiService.request(`/batches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
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

  // --- COURSE CURRICULUM SUBJECTS ---
  static async getCourseSubjects(courseId: string): Promise<AdminCourseSubject[]> {
    const res = await ApiService.request<any>(`/courses/${courseId}/subjects`);
    return Array.isArray(res) ? res : res.data || [];
  }

  static async addSubjectToCourse(courseId: string, data: { subjectId: string; displayOrder?: number; estimatedDuration?: string }): Promise<any> {
    return ApiService.request(`/courses/${courseId}/subjects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateCourseSubject(courseId: string, subjectId: string, data: { displayOrder?: number; estimatedDuration?: string }): Promise<any> {
    return ApiService.request(`/courses/${courseId}/subjects/${subjectId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async removeSubjectFromCourse(courseId: string, subjectId: string): Promise<any> {
    return ApiService.request(`/courses/${courseId}/subjects/${subjectId}`, {
      method: "DELETE",
    });
  }

  // --- BATCH ACADEMIC SUBJECTS ---
  static async getBatchSubjects(batchId: string): Promise<AdminBatchSubject[]> {
    const res = await ApiService.request<any>(`/batches/${batchId}/subjects`);
    return Array.isArray(res) ? res : res.data || [];
  }

  static async addSubjectToBatch(batchId: string, data: any): Promise<AdminBatchSubject> {
    const res = await ApiService.request<any>(`/batches/${batchId}/subjects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  static async updateBatchSubject(id: string, data: any): Promise<AdminBatchSubject> {
    const res = await ApiService.request<any>(`/batch-subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  static async assignTeacherToBatchSubject(id: string, teacherId: string): Promise<any> {
    return ApiService.request(`/batch-subjects/${id}/assign-teacher`, {
      method: "POST",
      body: JSON.stringify({ teacherId }),
    });
  }

  static async removeBatchSubject(id: string): Promise<any> {
    return ApiService.request(`/batch-subjects/${id}`, {
      method: "DELETE",
    });
  }

  // --- CLASSROOMS / ROOMS ---
  static async getRooms(params?: { search?: string; type?: string; status?: string }): Promise<AdminRoom[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.type) query.append("type", params.type);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/rooms${queryString}`);
    return Array.isArray(res) ? res : res.data?.rooms || res.rooms || [];
  }

  static async getRoomById(id: string): Promise<AdminRoom> {
    const res = await ApiService.request<any>(`/rooms/${id}`);
    return res.data || res;
  }

  static async createRoom(data: any): Promise<AdminRoom> {
    const res = await ApiService.request<any>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  static async updateRoom(id: string, data: any): Promise<AdminRoom> {
    const res = await ApiService.request<any>(`/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data || res;
  }

  static async deleteRoom(id: string): Promise<any> {
    return ApiService.request(`/rooms/${id}`, {
      method: "DELETE",
    });
  }

  // --- TIMETABLES ---
  static async getTimetables(params?: { batchId?: string; teacherId?: string; roomId?: string; dayOfWeek?: string }): Promise<AdminTimetableSlot[]> {
    const query = new URLSearchParams();
    if (params?.batchId) query.append("batchId", params.batchId);
    if (params?.teacherId) query.append("teacherId", params.teacherId);
    if (params?.roomId) query.append("roomId", params.roomId);
    if (params?.dayOfWeek) query.append("dayOfWeek", params.dayOfWeek);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const res = await ApiService.request<any>(`/timetable${queryString}`);
    return Array.isArray(res) ? res : res.timetables || res.data || [];
  }

  static async getBatchSchedule(batchId: string): Promise<any> {
    return ApiService.request(`/timetable/batch/${batchId}`);
  }

  static async getTeacherSchedule(teacherId: string): Promise<any> {
    return ApiService.request(`/timetable/teacher/${teacherId}`);
  }

  static async createTimetableSlot(data: any): Promise<any> {
    return ApiService.request("/timetable", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTimetableSlot(id: string, data: any): Promise<any> {
    return ApiService.request(`/timetable/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteTimetableSlot(id: string): Promise<any> {
    return ApiService.request(`/timetable/${id}`, {
      method: "DELETE",
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
