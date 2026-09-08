import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { TeacherNavbar } from "./TeacherNavbar";
import { TeacherSidebar } from "./TeacherSidebar";
import "./TeacherLayout.css";

export const TeacherLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="teacher-layout">
      {/* 1. Full-width Top Navbar */}
      <TeacherNavbar onToggleSidebar={handleToggleSidebar} />

      {/* 2. Body Container: Left Sidebar & Right Main Content */}
      <div className="teacher-layout__container">
        <TeacherSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        <main className="teacher-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
