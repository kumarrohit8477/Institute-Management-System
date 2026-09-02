import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  NotificationApiService,
  StudentNotificationItem,
} from "../../services/notificationApi";
import { InstituteApiService } from "../../services/instituteApi";
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
        setNotifications(response.notifications);
      } catch (error) {
        console.warn(
          "Using sample notifications fallback:",
          error
        );
      }
    };

    loadNotifications();
  }, []);

  const sampleFallbackNotifications: StudentNotificationItem[] =
    notifications.length > 0
      ? notifications
      : [
          {
            id: "notif-1",
            title: "JEE Main Grand Mock 1 Live Now",
            message:
              "The full-syllabus CBT benchmark mock test is available. Make sure to complete before the deadline.",
            type: "TEST",
            actionUrl: "/student/tests",
            isRead: false,
            createdAt: "2026-09-01T08:30:00Z",
          },
          {
            id: "notif-2",
            title: "New Study Materials Uploaded",
            message:
              "Dr. Harish Verma has uploaded Physics Chapter 4 Electrodynamics derivation notes.",
            type: "ANNOUNCEMENT",
            actionUrl: "/student/materials",
            isRead: false,
            createdAt: "2026-08-31T14:15:00Z",
          },
          {
            id: "notif-3",
            title: "Fee Receipt Issued",
            message:
              "Installment 1 payment of ₹50,000 via UPI has been verified and official receipt generated.",
            type: "FEE",
            actionUrl: "/student/fees",
            isRead: false,
            createdAt: "2026-08-30T10:00:00Z",
          },
        ];

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
            Student Learning Portal
            <span className="student-navbar__separator">
              •
            </span>
            <span className="student-navbar__institute-code">
              {institute?.code || "CAMPUS"}
            </span>
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
                {sampleFallbackNotifications
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
                  ))}
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