import React, { createContext, useState, useEffect, ReactNode } from "react";
import { MobileAuthService, MobileLoginCredentials } from "../services/authService";
import { StorageService } from "../services/storage";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface AuthContextType {
  user: any | null;
  student: any | null;
  teacher: any | null;
  institute: any | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: MobileLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [teacher, setTeacher] = useState<any | null>(null);
  const [institute, setInstitute] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const token = await StorageService.getItem("ims_mobile_access_token");
        if (token && isMounted) {
          const uStr = await StorageService.getItem("ims_mobile_user");
          const sStr = await StorageService.getItem("ims_mobile_student");
          const tStr = await StorageService.getItem("ims_mobile_teacher");
          const iStr = await StorageService.getItem("ims_mobile_institute");

          if (uStr && isMounted) setUser(JSON.parse(uStr));
          if (sStr && isMounted) setStudent(JSON.parse(sStr));
          if (tStr && isMounted) setTeacher(JSON.parse(tStr));
          if (iStr && isMounted) setInstitute(JSON.parse(iStr));
        }
      } catch (err) {
        console.warn("Mobile auth restoration error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Safety timer: ensure loading screen dismissed after 1 second max
    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 1000);

    initializeAuth().then(() => clearTimeout(timer));

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const login = async (credentials: MobileLoginCredentials) => {
    const data = await MobileAuthService.login(credentials);
    setUser(data.user);
    setStudent(data.student || null);
    setTeacher(data.teacher || null);
    setInstitute(data.institute || null);
  };

  const logout = async () => {
    try {
      await MobileAuthService.logout();
    } finally {
      setUser(null);
      setStudent(null);
      setTeacher(null);
      setInstitute(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        teacher,
        institute,
        role: (user?.role as UserRole) || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
