import React, {
  useState,
  useEffect,
} from "react";

import { Link } from "react-router-dom";

import {
  NotificationApiService,
  StudentNotificationItem,
} from "@/src/services/notificationApi";

import {
  CheckCheck,
  FileText,
  Award,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

import "./StudentNotificationsPage.css";

export const StudentNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] =
    useState<StudentNotificationItem[]>([]);

  const [selectedType, setSelectedType] =
    useState<string>("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await NotificationApiService.getMyNotifications();

        if (
          response.notifications &&
          Array.isArray(response.notifications)
        ) {
          setNotifications(response.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to load notifications from database:", err);
        setNotifications([]);
      }
    };

    load();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApiService.markAsRead(id);
    } catch {
      // Keep local update even if API is unavailable.
    }

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationApiService.markAllAsRead();
    } catch {
      // Keep local update even if API is unavailable.
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TEST":
        return (
          <FileText
            size={20}
            className="student-notifications__icon--test"
          />
        );

      case "RESULT":
        return (
          <Award
            size={20}
            className="student-notifications__icon--result"
          />
        );

      case "FEE":
        return (
          <CreditCard
            size={20}
            className="student-notifications__icon--fee"
          />
        );

      case "TIMETABLE":
        return (
          <Calendar
            size={20}
            className="student-notifications__icon--timetable"
          />
        );

      default:
        return (
          <AlertCircle
            size={20}
            className="student-notifications__icon--default"
          />
        );
    }
  };

  const filteredNotifications =
    notifications.filter((notification) => {
      if (
        selectedType !== "ALL" &&
        notification.type !== selectedType
      ) {
        return false;
      }

      return true;
    });

  const unreadTotal = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="student-notifications">
      <div className="student-notifications__header">
        <div>
          <h1>Notifications & Campus Alerts</h1>

          <p>
            Real-time updates regarding exams, classes,
            materials, fee receipts, and official
            announcements.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn btn-outline student-notifications__mark-all"
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="card student-notifications__filters-card">
        <div className="student-notifications__filters">
          {[
            "ALL",
            "ANNOUNCEMENT",
            "TEST",
            "FEE",
            "TIMETABLE",
          ].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setSelectedType(type)
              }
              className={`btn student-notifications__filter-button ${
                selectedType === type
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              {type === "ALL"
                ? "All Updates"
                : type}
            </button>
          ))}
        </div>
      </div>

      <div className="student-notifications__list">
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertCircle size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Notifications</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              No system announcements or alerts recorded in the database.
            </p>
          </div>
        ) : (
          filteredNotifications.map(
            (notification) => (
            <div
              key={notification.id}
              className={`card student-notifications__item ${
                notification.isRead
                  ? "student-notifications__item--read"
                  : "student-notifications__item--unread"
              }`}
            >
              <div className="student-notifications__content">
                <div className="student-notifications__icon-box">
                  {getIcon(notification.type)}
                </div>

                <div className="student-notifications__details">
                  <div className="student-notifications__meta">
                    <span className="badge badge-primary">
                      {notification.type}
                    </span>

                    {!notification.isRead && (
                      <span className="badge badge-warning student-notifications__new-badge">
                        NEW
                      </span>
                    )}

                    <span className="student-notifications__date">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <h3>{notification.title}</h3>

                  <p>
                    {notification.message}
                  </p>
                </div>
              </div>

              <div className="student-notifications__actions">
                {notification.actionUrl && (
                  <Link
                    to={notification.actionUrl}
                    onClick={() =>
                      handleMarkAsRead(
                        notification.id
                      )
                    }
                    className="btn btn-primary student-notifications__details-button"
                  >
                    View Details
                    <ExternalLink size={13} />
                  </Link>
                )}

                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() =>
                      handleMarkAsRead(
                        notification.id
                      )
                    }
                    className="btn btn-outline student-notifications__read-button"
                    title="Mark as read"
                  >
                    <CheckCircle2 size={15} />
                  </button>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};