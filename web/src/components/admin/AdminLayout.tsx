import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar } from "./AdminSidebar";
import "./AdminLayout.css";

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* 1. Full-width Top Navbar (100vw) */}
      <AdminNavbar onToggleSidebar={handleToggleSidebar} />

      {/* 2. Body Container: Left Sidebar & Right Main Content */}
      <div className="admin-layout__container">
        <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
