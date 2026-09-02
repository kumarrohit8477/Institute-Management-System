import ApiService from "./api";

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

export interface AdminTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminCourse {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  durationMonths: number;
  status: string;
  subjects?: { id: string; name: string; code: string }[];
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
  _count?: { students: number };
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
  static async getTeachers(): Promise<AdminTeacher[]> {
    const res = await ApiService.request<any>("/teachers");
    return Array.isArray(res) ? res : res.teachers || [];
  }

  static async createTeacher(data: any): Promise<any> {
    return ApiService.request("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Courses
  static async getCourses(): Promise<AdminCourse[]> {
    const res = await ApiService.request<any>("/courses");
    return Array.isArray(res) ? res : res.courses || [];
  }

  static async createCourse(data: any): Promise<any> {
    return ApiService.request("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Batches
  static async getBatches(): Promise<AdminBatch[]> {
    const res = await ApiService.request<any>("/batches");
    return Array.isArray(res) ? res : res.batches || [];
  }

  static async createBatch(data: any): Promise<any> {
    return ApiService.request("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    });
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
