import React from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminNavbar } from "@/src/components/superadmin/SuperAdminNavbar";
import { SuperAdminSidebar } from "@/src/components/superadmin/SuperAdminSidebar";
import "./SuperAdminLayout.css";

export const SuperAdminLayout: React.FC = () => {
  return (
    <div className="superadmin-layout">
      <SuperAdminNavbar />
      <div className="superadmin-layout__container">
        <SuperAdminSidebar />
        <main className="superadmin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
