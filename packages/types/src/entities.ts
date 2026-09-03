import {
  UserRole,
  InstituteStatus,
  UserStatus,
  StudentStatus,
  TeacherStatus,
  BatchStatus,
  AttendanceStatus,
  MaterialType,
  QuestionType,
  DifficultyLevel,
  TestStatus,
  AttemptStatus,
  FeeStatus,
  PaymentMode,
  PaymentStatus,
  NotificationType,
  NotificationChannel,
  BatchSubjectStatus,
  RoomType,
  RoomStatus,
  DurationUnit
} from "./enums";

export interface IBaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ITenantEntity extends IBaseEntity {
  instituteId: string;
}

export interface IInstitute extends IBaseEntity {
  name: string;
  code: string;
  customDomain?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  status: InstituteStatus;
  settings?: Record<string, any> | null;
}

export interface IUser extends IBaseEntity {
  instituteId?: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date | string | null;
}

export interface IStudent extends ITenantEntity {
  userId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  phone?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  address?: string | null;
  status: StudentStatus;
  enrollmentDate: Date | string;
}

export interface ITeacher extends ITenantEntity {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification?: string | null;
  specialization?: string | null;
  experienceYears?: number;
  skills?: string | null;
  userId?: string | null;
  status: TeacherStatus;
}

export interface ICourse extends ITenantEntity {
  name: string;
  code: string;
  description?: string | null;
  duration?: number | null;
  durationUnit?: DurationUnit | string | null;
  durationMonths?: number | null;
  totalFees?: number | string | null;
  isActive: boolean;
}

export interface ISubject extends ITenantEntity {
  courseId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export interface ICourseSubject extends IBaseEntity {
  courseId: string;
  subjectId: string;
  displayOrder: number;
  estimatedDuration?: string | null;
}

export interface IBatch extends ITenantEntity {
  courseId: string;
  name: string;
  code: string;
  academicSession?: string | null;
  description?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  maxCapacity: number;
  maxStrength?: number;
  status: BatchStatus;
}

export interface IBatchSubject extends IBaseEntity {
  batchId: string;
  subjectId: string;
  assignedTeacherId?: string | null;
  startDate?: Date | string | null;
  expectedEndDate?: Date | string | null;
  status: BatchSubjectStatus;
  progress: number;
  notes?: string | null;
}

export interface IRoom extends ITenantEntity {
  name: string;
  code: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
}

