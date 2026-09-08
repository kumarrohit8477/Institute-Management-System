import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Calendar,
  User,
  X,
} from "lucide-react";
import "./TeacherSidebar.css";

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      to: "/teacher/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/teacher/batches",
      label: "My Batches & Subjects",
      icon: Layers,
    },
    {
      to: "/teacher/timetable",
      label: "Class Timetable",
      icon: Calendar,
    },
    {
      to: "/teacher/profile",
      label: "My Profile",
      icon: User,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="teacher-sidebar__overlay"
          aria-hidden="true"
        />
      )}

      <aside
        className={`teacher-sidebar ${isOpen ? "teacher-sidebar--open" : ""}`}
      >
        {/* Mobile Close */}
        <div className="teacher-sidebar__mobile-header">
          <button
            type="button"
            onClick={onClose}
            className="teacher-sidebar__close-button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="teacher-sidebar__navigation">
          <div className="teacher-sidebar__section-title">Faculty Navigation</div>
          <ul className="teacher-sidebar__nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="teacher-sidebar__nav-item">
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `teacher-sidebar__nav-link ${
                        isActive ? "teacher-sidebar__nav-link--active" : ""
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          className={`teacher-sidebar__nav-icon ${
                            isActive ? "teacher-sidebar__nav-icon--active" : ""
                          }`}
                        />
                        <span className="teacher-sidebar__nav-text">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="teacher-sidebar__footer">
          <div className="teacher-sidebar__term-status">
            <div className="teacher-sidebar__status-dot" />
            <span className="teacher-sidebar__status-text">Faculty Portal Connected</span>
          </div>
          <div className="teacher-sidebar__session">Academic Term 2026-2027</div>
        </div>
      </aside>
    </>
  );
};
