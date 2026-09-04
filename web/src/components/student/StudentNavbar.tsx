import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import {
  NotificationApiService,
  StudentNotificationItem,
} from "@/src/services/notificationApi";
import { InstituteApiService } from "@/src/services/instituteApi";
import {
  LogOut,
  Bell,
  User as UserIcon,
  Menu,
  ExternalLink,
} from "lucide-react";

import "./StudentNavbar.css";

interface StudentNavbarProps {
  onToggleSidebar?: () => void;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  onToggleSidebar,
}) => {
  const { user, student, institute, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [notifications, setNotifications] = useState<
    StudentNotificationItem[]
  >([]);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response =
          await NotificationApiService.getMyNotifications();

        setUnreadCount(response.unreadCount);
        setNotifications(Array.isArray(response.notifications) ? response.notifications : []);
      } catch (error) {
        console.error(
          "Failed to load notifications from database:",
          error
        );
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationApiService.markAllAsRead();
      setUnreadCount(0);
    } catch {
      setUnreadCount(0);
    }
  };

  const currentLogo = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const studentInitial =
    student?.firstName?.[0] ||
    user?.email?.[0]?.toUpperCase();

  const studentName = student
    ? `${student.firstName} ${student.lastName}`
    : user?.email?.split("@")[0];

  return (
    <header className="student-navbar">
      <div className="student-navbar__brand">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="student-navbar__menu-button"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {currentLogo ? (
          <img
            src={currentLogo}
            alt={institute?.name || "Institute Logo"}
            className="student-navbar__logo-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="student-navbar__logo-fallback">
            {institute?.name?.[0] || "IMS"}
          </div>
        )}

        <div className="student-navbar__brand-info">
          <div className="student-navbar__brand-title">
            {institute?.name || "Institute Management System"}
          </div>

          <div className="student-navbar__brand-subtitle">
            {institute?.tagline ? (
              <span className="student-navbar__tagline" title={institute.tagline} style={{ fontStyle: "italic", color: "#60a5fa" }}>
                "{institute.tagline}"
              </span>
            ) : (
              "Student Learning Portal"
            )}
          </div>
        </div>
      </div>

      <div className="student-navbar__actions">
        <div className="student-navbar__notification-wrapper">
          <button
            type="button"
            onClick={() => setPanelOpen((prev) => !prev)}
            className={`student-navbar__notification-button ${
              panelOpen
                ? "student-navbar__notification-button--active"
                : ""
            }`}
            title="Notifications"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="student-navbar__notification-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <div className="student-navbar__notification-popover">
              <div className="student-navbar__popover-header">
                <span className="student-navbar__popover-title">
                  Notifications ({unreadCount} new)
                </span>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="student-navbar__mark-read-button"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="student-navbar__notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                    No new notifications
                  </div>
                ) : (
                  notifications
                    .slice(0, 4)
                    .map((notification) => (
                    <div
                      key={notification.id}
                      className={`student-navbar__notification-item ${
                        notification.isRead
                          ? "student-navbar__notification-item--read"
                          : "student-navbar__notification-item--unread"
                      }`}
                    >
                      <div className="student-navbar__notification-top">
                        <span className="student-navbar__notification-title">
                          {notification.title}
                        </span>

                        <span className="student-navbar__notification-type">
                          {notification.type}
                        </span>
                      </div>

                      <p className="student-navbar__notification-message">
                        {notification.message}
                      </p>

                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          onClick={() => setPanelOpen(false)}
                          className="student-navbar__notification-link"
                        >
                          View Details
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="student-navbar__popover-footer">
                <Link
                  to="/student/notifications"
                  onClick={() => setPanelOpen(false)}
                  className="student-navbar__view-all-link"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="student-navbar__user-profile">
          <div className="student-navbar__user-avatar">
            {studentInitial || <UserIcon size={18} />}
          </div>

          <div className="student-navbar__user-info">
            <span className="student-navbar__user-name">
              {studentName}
            </span>

            <span className="student-navbar__user-admission">
              {student?.admissionNumber ||
                "Student Workspace"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="student-navbar__logout-button"
          title="Sign Out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};