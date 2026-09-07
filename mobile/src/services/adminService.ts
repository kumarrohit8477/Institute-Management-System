import { MobileApiService } from "./api";

export interface StudentItem {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  batch?: { id: string; name: string; code: string } | null;
  createdAt?: string;
}

export interface TeacherItem {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  status: string;
  subjects?: { subject?: { id: string; name: string; code: string } }[];
}

export interface CourseItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  durationMonths?: number;
  totalFees?: number | string;
  status: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  courseId?: string;
  course?: { id: string; name: string; code: string };
}

export interface BatchItem {
  id: string;
  name: string;
  code: string;
  courseId: string;
  course?: { id: string; name: string; code: string };
  startDate: string;
  endDate?: string | null;
  status: string;
  maxCapacity?: number;
  _count?: { students: number };
}

export interface RoomItem {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: "CLASSROOM" | "LAB" | "ONLINE" | "OTHER";
  status: "ACTIVE" | "INACTIVE";
}

export interface TimetableSlotItem {
  id: string;
  batchId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  batch?: { name: string; code: string };
  subject?: { name: string; code: string };
  teacher?: { firstName: string; lastName: string };
  room?: { name: string };
}

export interface MaterialItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType: string;
  batchId: string;
  subjectId: string;
  batch?: { name: string };
  subject?: { name: string };
  createdAt: string;
}

export class MobileAdminService {
  // Students
  static async getStudents(params?: { search?: string; status?: string; batchId?: string; page?: number }): Promise<StudentItem[]> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.batchId ? { batchId: params.batchId } : {}),
      page: String(params?.page || 1),
      limit: "50",
    }).toString();
    const res = await MobileApiService.request<any>(`/students?${query}`);
    return Array.isArray(res) ? res : res.students || res.data || [];
  }

  static async createStudent(data: any): Promise<StudentItem> {
    return MobileApiService.request("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateStudent(id: string, data: any): Promise<StudentItem> {
    return MobileApiService.request(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteStudent(id: string): Promise<any> {
    return MobileApiService.request(`/students/${id}`, {
      method: "DELETE",
    });
  }

  // Teachers
  static async getTeachers(params?: { search?: string; status?: string }): Promise<TeacherItem[]> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/teachers?${query}`);
    return Array.isArray(res) ? res : res.teachers || res.data || [];
  }

  static async createTeacher(data: any): Promise<TeacherItem> {
    return MobileApiService.request("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTeacher(id: string, data: any): Promise<TeacherItem> {
    return MobileApiService.request(`/teachers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteTeacher(id: string): Promise<any> {
    return MobileApiService.request(`/teachers/${id}`, {
      method: "DELETE",
    });
  }

  static async assignTeacherSubject(teacherId: string, subjectId: string): Promise<any> {
    return MobileApiService.request(`/teachers/${teacherId}/subjects`, {
      method: "POST",
      body: JSON.stringify({ subjectId }),
    });
  }

  // Courses
  static async getCourses(params?: { search?: string; status?: string }): Promise<CourseItem[]> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/courses?${query}`);
    return Array.isArray(res) ? res : res.courses || res.data || [];
  }

  static async createCourse(data: any): Promise<CourseItem> {
    return MobileApiService.request("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateCourse(id: string, data: any): Promise<CourseItem> {
    return MobileApiService.request(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteCourse(id: string): Promise<any> {
    return MobileApiService.request(`/courses/${id}`, {
      method: "DELETE",
    });
  }

  // Subjects
  static async getSubjects(params?: { courseId?: string; search?: string }): Promise<SubjectItem[]> {
    const query = new URLSearchParams({
      ...(params?.courseId ? { courseId: params.courseId } : {}),
      ...(params?.search ? { search: params.search } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/subjects?${query}`);
    return Array.isArray(res) ? res : res.subjects || res.data || [];
  }

  static async createSubject(data: any): Promise<SubjectItem> {
    return MobileApiService.request("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateSubject(id: string, data: any): Promise<SubjectItem> {
    return MobileApiService.request(`/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteSubject(id: string): Promise<any> {
    return MobileApiService.request(`/subjects/${id}`, {
      method: "DELETE",
    });
  }

  // Batches
  static async getBatches(params?: { search?: string; status?: string }): Promise<BatchItem[]> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/batches?${query}`);
    return Array.isArray(res) ? res : res.batches || res.data || [];
  }

  static async getBatchById(id: string): Promise<any> {
    return MobileApiService.request(`/batches/${id}`);
  }

  static async createBatch(data: any): Promise<BatchItem> {
    return MobileApiService.request("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateBatch(id: string, data: any): Promise<BatchItem> {
    return MobileApiService.request(`/batches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteBatch(id: string): Promise<any> {
    return MobileApiService.request(`/batches/${id}`, {
      method: "DELETE",
    });
  }

  // Rooms
  static async getRooms(params?: { search?: string; type?: string }): Promise<RoomItem[]> {
    const query = new URLSearchParams({
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.type ? { type: params.type } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/rooms?${query}`);
    return Array.isArray(res) ? res : res.rooms || res.data?.rooms || [];
  }

  static async createRoom(data: any): Promise<RoomItem> {
    return MobileApiService.request("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateRoom(id: string, data: any): Promise<RoomItem> {
    return MobileApiService.request(`/rooms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteRoom(id: string): Promise<any> {
    return MobileApiService.request(`/rooms/${id}`, {
      method: "DELETE",
    });
  }

  // Timetables
  static async getTimetables(params?: { batchId?: string; teacherId?: string; dayOfWeek?: string }): Promise<TimetableSlotItem[]> {
    const query = new URLSearchParams({
      ...(params?.batchId ? { batchId: params.batchId } : {}),
      ...(params?.teacherId ? { teacherId: params.teacherId } : {}),
      ...(params?.dayOfWeek ? { dayOfWeek: params.dayOfWeek } : {}),
    }).toString();
    const res = await MobileApiService.request<any>(`/timetable?${query}`);
    return Array.isArray(res) ? res : res.timetables || res.data || [];
  }

  static async createTimetableSlot(data: any): Promise<TimetableSlotItem> {
    return MobileApiService.request("/timetable", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deleteTimetableSlot(id: string): Promise<any> {
    return MobileApiService.request(`/timetable/${id}`, {
      method: "DELETE",
    });
  }

  // Materials
  static async getMaterials(): Promise<MaterialItem[]> {
    const res = await MobileApiService.request<any>("/materials");
    return Array.isArray(res) ? res : res.materials || res.data || [];
  }

  static async createMaterial(data: any): Promise<MaterialItem> {
    return MobileApiService.request("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deleteMaterial(id: string): Promise<any> {
    return MobileApiService.request(`/materials/${id}`, {
      method: "DELETE",
    });
  }

  // Fees
  static async getFees(params?: { page?: number }): Promise<any> {
    return MobileApiService.request(`/fees?page=${params?.page || 1}&limit=20`);
  }

  // Attendance
  static async getAttendanceReport(params?: { batchId?: string; date?: string }): Promise<any> {
    const q = new URLSearchParams(params as any).toString();
    return MobileApiService.request(`/attendance?${q}`);
  }

  static async getInstituteInfo(): Promise<any> {
    return MobileApiService.request("/institute");
  }

  static async getDashboardStats(): Promise<{ students: number; teachers: number; courses: number; batches: number }> {
    const extractCount = (res: any, entityKey: string): number => {
      if (!res) return 0;
      if (Array.isArray(res)) return res.length;
      if (typeof res.total === "number") return res.total;
      if (typeof res.count === "number") return res.count;
      if (typeof res.meta?.total === "number") return res.meta.total;
      if (Array.isArray(res[entityKey])) return res[entityKey].length;
      if (Array.isArray(res.data)) return res.data.length;
      return 0;
    };

    const [stuRes, teaRes, couRes, batRes] = await Promise.allSettled([
      this.getStudents(),
      this.getTeachers(),
      this.getCourses(),
      this.getBatches(),
    ]);

    return {
      students: stuRes.status === "fulfilled" ? extractCount(stuRes.value, "students") : 0,
      teachers: teaRes.status === "fulfilled" ? extractCount(teaRes.value, "teachers") : 0,
      courses: couRes.status === "fulfilled" ? extractCount(couRes.value, "courses") : 0,
      batches: batRes.status === "fulfilled" ? extractCount(batRes.value, "batches") : 0,
    };
  }

  static async getStats(): Promise<any> {
    return this.getDashboardStats();
  }
}
