export type UserRole = "SUPER_ADMIN" | "ADMIN" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  logoUrl?: string | null;
  email?: string;
  phone?: string;
}

export interface StudentProfile {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  admissionDate?: string;
}

export interface AuthResponse {
  user: User;
  institute?: Institute | null;
  student?: StudentProfile | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  instituteCode?: string;
}
