import React from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminNavbar } from "./SuperAdminNavbar";
import { SuperAdminSidebar } from "./SuperAdminSidebar";

export const SuperAdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SuperAdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <SuperAdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
