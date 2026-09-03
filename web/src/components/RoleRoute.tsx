import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { UserRole } from "@/src/types/auth.types";

interface RoleRouteProps {
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  if (role !== allowedRole) {
    if (role === "SUPER_ADMIN") return <Navigate to="/superadmin/dashboard" replace />;
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
