// ==============================================================================
// INSTITUTE MANAGEMENT SYSTEM — CORE ENUMS
// ==============================================================================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT"
}

export enum InstituteStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  TRIAL = "TRIAL",
  ARCHIVED = "ARCHIVED"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED"
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PASSED_OUT = "PASSED_OUT",
  DROPPED = "DROPPED",
  PASSOUT = "PASSOUT",
  DROPOUT = "DROPOUT"
}

export enum TeacherStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  RESIGNED = "RESIGNED"
}

export enum BatchStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum BatchSubjectStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum RoomType {
  CLASSROOM = "CLASSROOM",
  LAB = "LAB",
  ONLINE = "ONLINE",
  OTHER = "OTHER"
}

export enum RoomStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum DurationUnit {
  DAYS = "DAYS",
  MONTHS = "MONTHS",
  YEARS = "YEARS"
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED"
}

export enum MaterialType {
  PDF = "PDF",
  DOC = "DOC",
  VIDEO = "VIDEO",
  LINK = "LINK",
  IMAGE = "IMAGE",
  OTHER = "OTHER"
}

export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  NUMERICAL = "NUMERICAL",
  TRUE_FALSE = "TRUE_FALSE",
  SUBJECTIVE = "SUBJECTIVE"
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export enum TestStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum AttemptStatus {
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  EVALUATED = "EVALUATED",
  ABANDONED = "ABANDONED"
}

export enum FeeStatus {
  PENDING = "PENDING",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
  CASH = "CASH",
  UPI = "UPI",
  CARD = "CARD",
  NET_BANKING = "NET_BANKING",
  CHEQUE = "CHEQUE",
  OTHER = "OTHER"
}

export enum PaymentMode {
  CASH = "CASH",
  UPI = "UPI",
  CARD = "CARD",
  NET_BANKING = "NET_BANKING",
  CHEQUE = "CHEQUE",
  OTHER = "OTHER"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum NotificationType {
  ANNOUNCEMENT = "ANNOUNCEMENT",
  ATTENDANCE = "ATTENDANCE",
  TEST = "TEST",
  RESULT = "RESULT",
  FEE = "FEE",
  TIMETABLE = "TIMETABLE",
  SYSTEM = "SYSTEM"
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH"
}

export enum PlanTier {
  FREE_TRIAL = "FREE_TRIAL",
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  ENTERPRISE = "ENTERPRISE"
}

export enum SubscriptionStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUAL = "ANNUAL"
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}
