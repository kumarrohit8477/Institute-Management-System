import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { StudentSidebar } from "@/src/components/student/StudentSidebar";
import { StudentNavbar } from "@/src/components/student/StudentNavbar";
import "./StudentLayout.css";

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="student-layout">
      {/* 1. Full-width Navbar spanning top of screen (100vw) */}
      <StudentNavbar onToggleSidebar={handleToggleSidebar} />

      {/* 2. Below Navbar: Sidebar on Left & Main Content on Right */}
      <div className="student-layout__container">
        <StudentSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        <main className="student-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};