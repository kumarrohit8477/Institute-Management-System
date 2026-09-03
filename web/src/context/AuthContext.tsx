import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, StudentProfile, Institute, LoginCredentials, UserRole } from "@/src/types/auth.types";
import ApiService from "@/src/services/api";

export interface AuthContextType {
  user: User | null;
  student: StudentProfile | null;
  institute: Institute | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<UserRole>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateInstituteLogo: (logoUrl: string | null) => void;
  updateInstituteTagline: (tagline: string | null) => void;
  refreshInstitute: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage and verify session
  useEffect(() => {
    const initializeAuth = async () => {
      const stored = localStorage.getItem("ims_user_profile");
      const token = localStorage.getItem("ims_access_token");

      if (stored && token) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed.user || null);
          setStudent(parsed.student || null);
          setInstitute(parsed.institute || null);

          // Verify with backend
          const me = await ApiService.getMe();
          if (me) {
            setUser(me);
            setStudent(me.student || null);
            setInstitute(me.institute || null);
          }
        } catch {
          ApiService.clearTokens();
          setUser(null);
          setStudent(null);
          setInstitute(null);
        }
      }
      setIsLoading(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
      setStudent(null);
      setInstitute(null);
    };

    window.addEventListener("ims_auth_unauthorized", handleUnauthorized);
    initializeAuth();

    return () => {
      window.removeEventListener("ims_auth_unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<UserRole> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiService.login(credentials);
      setUser(response.user);
      setStudent(response.student || null);
      setInstitute(response.institute || null);
      setIsLoading(false);
      return response.user.role;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || "Failed to log in";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await ApiService.logout();
    } finally {
      setUser(null);
      setStudent(null);
      setInstitute(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const updateInstituteLogo = (logoUrl: string | null) => {
    setInstitute((prev) => (prev ? { ...prev, logoUrl } : null));
    const stored = localStorage.getItem("ims_user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.institute) {
          parsed.institute.logoUrl = logoUrl;
          localStorage.setItem("ims_user_profile", JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  const updateInstituteTagline = (tagline: string | null) => {
    setInstitute((prev) => (prev ? { ...prev, tagline } : null));
    const stored = localStorage.getItem("ims_user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.institute) {
          parsed.institute.tagline = tagline;
          localStorage.setItem("ims_user_profile", JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  const refreshInstitute = async () => {
    try {
      const me = await ApiService.getMe();
      if (me?.institute) {
        setInstitute(me.institute);
        const stored = localStorage.getItem("ims_user_profile");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.institute = me.institute;
            localStorage.setItem("ims_user_profile", JSON.stringify(parsed));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Failed to refresh institute profile:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        institute,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
        updateInstituteLogo,
        updateInstituteTagline,
        refreshInstitute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
