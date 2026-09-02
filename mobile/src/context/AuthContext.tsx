import React, { createContext, useState, useEffect, ReactNode } from "react";
import { MobileAuthService, MobileLoginCredentials } from "../services/authService";
import { StorageService } from "../services/storage";

export interface AuthContextType {
  user: any | null;
  student: any | null;
  institute: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: MobileLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [institute, setInstitute] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await StorageService.getItem("ims_mobile_access_token");
        if (token) {
          const uStr = await StorageService.getItem("ims_mobile_user");
          const sStr = await StorageService.getItem("ims_mobile_student");
          const iStr = await StorageService.getItem("ims_mobile_institute");

          if (uStr) setUser(JSON.parse(uStr));
          if (sStr) setStudent(JSON.parse(sStr));
          if (iStr) setInstitute(JSON.parse(iStr));
        }
      } catch (err) {
        console.warn("Mobile auth restoration error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: MobileLoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await MobileAuthService.login(credentials);
      setUser(data.user);
      setStudent(data.student);
      setInstitute(data.institute);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await MobileAuthService.logout();
      setUser(null);
      setStudent(null);
      setInstitute(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        institute,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
