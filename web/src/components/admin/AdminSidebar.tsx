import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { InstituteApiService } from "../../services/instituteApi";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Calendar,
  FolderDown,
  CheckCircle2,
  Palette,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import "./AdminSidebar.css";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { institute } = useAuth();

  const currentLogo = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard Overview",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/students",
      label: "Student Management",
      icon: Users,
      badge: "Active",
    },
    {
      to: "/admin/teachers",
      label: "Teacher Management",
      icon: GraduationCap,
      badge: "Faculty",
    },
    {
      to: "/admin/courses",
      label: "Courses & Subjects",
      icon: BookOpen,
      badge: "Curriculum",
    },
    {
      to: "/admin/batches",
      label: "Batch Management",
      icon: Layers,
      badge: "Cohorts",
    },
    {
      to: "/admin/timetable",
      label: "Timetable Scheduling",
      icon: Calendar,
    },
    {
      to: "/admin/materials",
      label: "Study Materials",
      icon: FolderDown,
      badge: "Files",
    },
    {
      to: "/admin/attendance",
      label: "Attendance Tracking",
      icon: CheckCircle2,
    },
    {
      to: "/admin/branding",
      label: "Institute Branding",
      icon: Palette,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="admin-sidebar__overlay"
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${
          isOpen ? "admin-sidebar--open" : ""
        }`}
      >
        {/* Mobile-only header with close action */}
        <div className="admin-sidebar__mobile-header">
          <div className="admin-sidebar__brand">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt={institute?.name || "Logo"}
                className="admin-sidebar__logo-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="admin-sidebar__logo-fallback">
                {institute?.name?.[0] || "IMS"}
              </div>
            )}
            <div className="admin-sidebar__brand-info">
              <div className="admin-sidebar__title">
                {institute?.name || "Apex Academy"}
              </div>
              <div className="admin-sidebar__institute-name">
                Admin Console • {institute?.code || "CAMPUS"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-sidebar__close-button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar__navigation">
          <div className="admin-sidebar__section-title">
            Administration Modules
          </div>
          <ul className="admin-sidebar__nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.to} className="admin-sidebar__nav-item">
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `admin-sidebar__nav-link ${
                        isActive ? "admin-sidebar__nav-link--active" : ""
                      }`
                    }
                  >
                    <Icon size={18} className="admin-sidebar__nav-icon" />
                    <span className="admin-sidebar__nav-text">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="admin-sidebar__nav-badge">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Quick System Badge Card */}
          <div className="admin-sidebar__tenant-card">
            <p className="admin-sidebar__tenant-card-desc">
              Dedicated tenant isolation with academic quotas active.
            </p>
            <div className="admin-sidebar__tenant-card-status">
              <Sparkles size={12} className="text-emerald-400" />
              <span>Session 2026–2027 Active</span>
            </div>
          </div>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__term-status">
            <span className="admin-sidebar__status-dot" />
            <span className="admin-sidebar__status-text">
              IMS Control Active
            </span>
          </div>
          <div className="admin-sidebar__session">
            Admin Suite v1.3 • Online
          </div>
        </div>
      </aside>
    </>
  );
};
