import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { StudentApiService, StudentAcademics, StudentScheduleResponse, StudentAttendanceResponse } from "@/src/services/studentApi";
import { ExamApiService, AvailableTestItem } from "@/src/services/examApi";
import { NotificationApiService, StudentNotificationItem } from "@/src/services/notificationApi";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  Award,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

export const StudentDashboard: React.FC = () => {
  const { user, student, institute } = useAuth();
  const [academics, setAcademics] = useState<StudentAcademics | null>(null);
  const [schedule, setSchedule] = useState<StudentScheduleResponse | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendanceResponse | null>(null);
  const [tests, setTests] = useState<AvailableTestItem[]>([]);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [acadData, schedData, attData, testData, notifData] = await Promise.allSettled([
          StudentApiService.getMyAcademics(),
          StudentApiService.getMySchedule(),
          StudentApiService.getMyAttendance(),
          ExamApiService.getAvailableTests(),
          NotificationApiService.getMyNotifications()
        ]);

        if (acadData.status === "fulfilled") setAcademics(acadData.value);
        if (schedData.status === "fulfilled") setSchedule(schedData.value);
        if (attData.status === "fulfilled") setAttendance(attData.value);
        if (testData.status === "fulfilled" && Array.isArray(testData.value)) setTests(testData.value);
        if (notifData.status === "fulfilled" && Array.isArray(notifData.value)) setNotifications(notifData.value);
      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Determine today's day of week
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayClasses = schedule?.scheduleByDay?.[todayName] || [];

  const currentBatch = academics?.batches?.[0];
  const currentCourse = academics?.courses?.[0];
  const attPercentage = attendance?.statistics?.attendancePercentage ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
            <span>🎓 Student Portal</span>
            <span>•</span>
            <span>{institute?.name || "Institute Portal"}</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "#ffffff", marginBottom: "0.5rem" }}>
            Welcome back, {student?.firstName || user?.email?.split("@")[0]}! 👋
          </h1>
          <p style={{ color: "#e0e7ff", fontSize: "0.95rem", maxWidth: "600px" }}>
            Ready for your learning session today? Check your schedule, access lecture materials, and keep your attendance high.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "0.75rem", color: "#bfdbfe", textTransform: "uppercase", fontWeight: 600 }}>Admission No.</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>{student?.admissionNumber || "N/A"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "0.75rem", color: "#bfdbfe", textTransform: "uppercase", fontWeight: 600 }}>Roll Number</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>{currentBatch?.rollNumber || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-cols-3">
        {/* Current Academic Program */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
              <BookOpen size={18} color="var(--color-primary)" />
              <span>Current Course</span>
            </div>
            {currentCourse ? (
              <span className="badge badge-primary">{currentCourse.code}</span>
            ) : (
              <span className="badge badge-gray">Not Enrolled</span>
            )}
          </div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            {currentCourse?.name || "No Enrolled Course"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            <div><strong>Batch:</strong> {currentBatch ? `${currentBatch.name} (${currentBatch.code})` : "No Batch Assigned"}</div>
            <div><strong>Subjects:</strong> {academics?.subjects?.length || 0} Core Subjects Active</div>
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
            <Link to="/student/courses" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View Course Syllabus <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
              <TrendingUp size={18} color="var(--color-success)" />
              <span>Overall Attendance</span>
            </div>
            <span className={`badge ${attPercentage >= 75 ? "badge-success" : "badge-danger"}`}>
              {attPercentage >= 75 ? "Good Standing" : "Low Attendance"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: attPercentage >= 75 ? "var(--color-success)" : "var(--color-danger)" }}>
                {attPercentage}%
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                {attendance?.statistics?.presentCount || 0} Present / {attendance?.statistics?.totalDays || 0} Days Logged
              </div>
            </div>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f0fdf4",
                border: "4px solid #22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#15803d"
              }}
            >
              {Math.round(attPercentage)}%
            </div>
          </div>
          <div style={{ width: "100%", background: "#e2e8f0", height: "8px", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(attPercentage, 100)}%`, background: attPercentage >= 75 ? "#10b981" : "#ef4444", height: "100%" }} />
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
            <Link to="/student/attendance" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View Attendance History <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Academic Faculty */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
              <Award size={18} color="#8b5cf6" />
              <span>Assigned Faculty</span>
            </div>
            <span className="badge badge-gray">{academics?.teachers?.length || 0} Teachers</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(!academics?.teachers || academics.teachers.length === 0) ? (
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "0.5rem 0" }}>
                No instructors assigned yet.
              </div>
            ) : (
              academics.teachers.slice(0, 2).map((t, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f3e8ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                    {t.firstName?.[0] || "T"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.firstName} {t.lastName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {t.subjectName || "Core Faculty"} • {t.qualification || "Instructor"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
            <Link to="/student/teachers" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              Meet All Faculty <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Classes & Notifications / Upcoming Tests */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Today's Classes */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Today's Classes & Lectures</h2>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                Schedule for {todayName.charAt(0) + todayName.slice(1).toLowerCase()}
              </div>
            </div>
            <Link to="/student/timetable" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
              <Calendar size={14} /> Full Weekly Timetable
            </Link>
          </div>

          {todayClasses.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--color-text-muted)" }}>
              <Calendar size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
              <div style={{ fontWeight: 600, color: "var(--color-text-main)" }}>No scheduled classes today</div>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Enjoy your revision time or check study materials!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {todayClasses.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        background: "#eff6ff",
                        color: "var(--color-primary)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        textAlign: "center"
                      }}
                    >
                      <Clock size={16} style={{ marginBottom: "2px" }} />
                      <div>{slot.startTime}</div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-main)" }}>
                        {slot.subject?.name || "Subject Lecture"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.2rem" }}>
                        <span>👨‍🏫 {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName}` : "Faculty Assigned"}</span>
                        {slot.roomNumber && (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <MapPin size={12} /> Room {slot.roomNumber}
                          </span>
                        )}
                        <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>
                          {slot.classType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {slot.meetingLink ? (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
                      >
                        <Video size={14} /> Join Online
                      </a>
                    ) : (
                      <span className="badge badge-gray" style={{ padding: "0.4rem 0.75rem" }}>
                        In-Person
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side column: Upcoming Tests & Notifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Upcoming Exams Preview */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: "1rem" }}>Upcoming Tests</h3>
              <span className="badge badge-warning">{tests.length} Available</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {tests.length === 0 ? (
                <div style={{ padding: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  No active tests scheduled in database.
                </div>
              ) : (
                tests.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    to="/student/tests"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        ⏱️ {t.durationMinutes} Mins • Total Marks: {t.totalMarks}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: "1rem" }}>Announcements</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "0.5rem 0", color: "var(--color-text-muted)" }}>
                  No recent notifications found.
                </div>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: "0.5rem" }}>
                    <AlertCircle size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                        {n.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
