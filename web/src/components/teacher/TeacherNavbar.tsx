import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { InstituteApiService } from "@/src/services/instituteApi";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import "./TeacherNavbar.css";

interface TeacherNavbarProps {
  onToggleSidebar?: () => void;
}

export const TeacherNavbar: React.FC<TeacherNavbarProps> = ({
  onToggleSidebar,
}) => {
  const { user, institute, logout } = useAuth();
  const teacher = user?.teacher;

  const currentLogo = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const teacherInitial =
    teacher?.firstName?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    "T";

  const teacherName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : user?.name || user?.email?.split("@")[0] || "Faculty Member";

  return (
    <header className="teacher-navbar">
      {/* Brand & Campus info */}
      <div className="teacher-navbar__brand">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="teacher-navbar__menu-button"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {currentLogo ? (
          <img
            src={currentLogo}
            alt={institute?.name || "Institute Logo"}
            className="teacher-navbar__logo-image"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="teacher-navbar__logo-fallback">
            {institute?.name?.[0] || "IMS"}
          </div>
        )}

        <div className="teacher-navbar__brand-info">
          <div className="teacher-navbar__brand-title">
            {institute?.name || "Apex Institute"}
          </div>
          <div className="teacher-navbar__brand-subtitle">
            {institute?.tagline ? (
              <span
                className="teacher-navbar__tagline"
                title={institute.tagline}
                style={{ fontStyle: "italic", color: "#4f46e5" }}
              >
                "{institute.tagline}"
              </span>
            ) : (
              "Faculty Workspace"
            )}
          </div>
        </div>
      </div>

      {/* Right User & Logout */}
      <div className="teacher-navbar__actions">
        {/* User Identity Chip */}
        <Link
          to="/teacher/profile"
          className="teacher-navbar__user-profile"
          style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
          title="View Faculty Profile"
        >
          <div className="teacher-navbar__user-avatar">
            {teacherInitial || <UserIcon size={16} />}
          </div>

          <div className="teacher-navbar__user-info">
            <span className="teacher-navbar__user-name">{teacherName}</span>
            <span className="teacher-navbar__user-role">
              {teacher?.employeeCode ? `Emp Code: ${teacher.employeeCode}` : "Instructor"}
            </span>
          </div>

          <span className="teacher-navbar__role-badge">FACULTY</span>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="teacher-navbar__logout-button"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
