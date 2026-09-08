import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { InstituteApiService } from "@/src/services/instituteApi";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  FolderDown,
  CheckCircle2,
  FileCheck2,
  Trophy,
  CreditCard,
  User,
  X,
} from "lucide-react";
import "./StudentSidebar.css";

interface StudentSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { institute, student } = useAuth();

  const currentLogo = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const navItems = [
    {
      to: "/student/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/student/courses",
      label: "My Courses",
      icon: BookOpen,
    },
    {
      to: "/student/subjects",
      label: "My Subjects",
      icon: Layers,
    },
    {
      to: "/student/timetable",
      label: "Timetable",
      icon: Calendar,
    },
    {
      to: "/student/materials",
      label: "Study Materials",
      icon: FolderDown,
    },
    {
      to: "/student/attendance",
      label: "Attendance",
      icon: CheckCircle2,
    },
    {
      to: "/student/tests",
      label: "Online Tests",
      icon: FileCheck2,
    },
    {
      to: "/student/results",
      label: "Results & Ranks",
      icon: Trophy,
    },
    {
      to: "/student/fees",
      label: "Fees & Invoices",
      icon: CreditCard,
    },
    {
      to: "/student/profile",
      label: "My Profile",
      icon: User,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="student-sidebar__overlay"
          aria-hidden="true"
        />
      )}

      <aside
        className={`student-sidebar ${isOpen ? "student-sidebar--open" : ""
          }`}
      >
        {/* Mobile-only header with close action */}
        <div className="student-sidebar__mobile-header">
          <button
            type="button"
            onClick={onClose}
            className="student-sidebar__close-button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="student-sidebar__navigation">
          <div className="student-sidebar__section-title">Navigation Menu</div>
          <ul className="student-sidebar__nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.to}
                  className="student-sidebar__nav-item"
                >
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `student-sidebar__nav-link ${isActive
                        ? "student-sidebar__nav-link--active"
                        : ""
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={`student-sidebar__nav-icon ${isActive
                              ? "student-sidebar__nav-icon--active"
                              : ""
                            }`}
                        />

                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};