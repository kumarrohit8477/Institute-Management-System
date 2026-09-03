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

  const sampleNotifications: StudentNotificationItem[] =
    [
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
          "Dr. Harish Verma has uploaded Physics Chapter 4 Electrodynamics derivation notes with solved problem sets.",
        type: "ANNOUNCEMENT",
        actionUrl: "/student/materials",
        isRead: false,
        createdAt: "2026-08-31T14:15:00Z",
      },
      {
        id: "notif-3",
        title: "Fee Receipt Issued",
        message:
          "Installment 1 payment of ₹50,000 via UPI has been verified and official receipt voucher generated.",
        type: "FEE",
        actionUrl: "/student/fees",
        isRead: true,
        createdAt: "2026-08-30T10:00:00Z",
      },
      {
        id: "notif-4",
        title: "Timetable Adjustment for Friday",
        message:
          "Mathematics class on Friday has been moved to 11:00 AM in Room LH-101.",
        type: "TIMETABLE",
        actionUrl: "/student/timetable",
        isRead: true,
        createdAt: "2026-08-28T09:00:00Z",
      },
    ];

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await NotificationApiService.getMyNotifications();

        if (
          response.notifications &&
          response.notifications.length > 0
        ) {
          setNotifications(response.notifications);
        } else {
          setNotifications(sampleNotifications);
        }
      } catch {
        setNotifications(sampleNotifications);
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
        {filteredNotifications.map(
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
        )}
      </div>
    </div>
  );
};