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
  NotificationChannel
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
  status: TeacherStatus;
}

export interface ICourse extends ITenantEntity {
  name: string;
  code: string;
  description?: string | null;
  durationMonths?: number | null;
  isActive: boolean;
}

export interface ISubject extends ITenantEntity {
  courseId: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export interface IBatch extends ITenantEntity {
  courseId: string;
  name: string;
  code: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  maxCapacity: number;
  status: BatchStatus;
}
