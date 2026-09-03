import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { StudentApiService, StudentAcademics, StudentScheduleResponse, StudentAttendanceResponse } from "@/src/services/studentApi";
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [acadData, schedData, attData] = await Promise.allSettled([
          StudentApiService.getMyAcademics(),
          StudentApiService.getMySchedule(),
          StudentApiService.getMyAttendance()
        ]);

        if (acadData.status === "fulfilled") setAcademics(acadData.value);
        if (schedData.status === "fulfilled") setSchedule(schedData.value);
        if (attData.status === "fulfilled") setAttendance(attData.value);
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
  const attPercentage = attendance?.statistics?.attendancePercentage ?? 92.5;

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
            <span>{institute?.name || "Apex Academy"}</span>
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
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>{student?.admissionNumber || "ADM-2026-001"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "0.75rem", color: "#bfdbfe", textTransform: "uppercase", fontWeight: 600 }}>Roll Number</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>{currentBatch?.rollNumber || "JEE-M1-01"}</div>
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
            <span className="badge badge-primary">{currentCourse?.code || "JEE-2027"}</span>
          </div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            {currentCourse?.name || "IIT-JEE 2-Year Advanced Program"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            <div><strong>Batch:</strong> {currentBatch?.name || "JEE Morning Star Batch"} ({currentBatch?.code || "BATCH-JEE-M1"})</div>
            <div><strong>Subjects:</strong> {academics?.subjects?.length || 3} Core Subjects Active</div>
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
                {attendance?.statistics?.presentCount || 37} Present / {attendance?.statistics?.totalDays || 40} Days Logged
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
            <span className="badge badge-gray">{academics?.teachers?.length || 2} Teachers</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(academics?.teachers?.slice(0, 2) || [
              { firstName: "Dr. Harish", lastName: "Verma", subjectName: "Physics", qualification: "Ph.D. IIT Kanpur" },
              { firstName: "Prof. Sunita", lastName: "Ramanujan", subjectName: "Mathematics", qualification: "M.Sc Gold Medalist" }
            ]).map((t, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f3e8ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                  {t.firstName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.firstName} {t.lastName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {t.subjectName || "Core Faculty"} • {t.qualification || "Ph.D."}
                  </div>
                </div>
              </div>
            ))}
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
                        {slot.subject.name}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.2rem" }}>
                        <span>👨‍🏫 {slot.teacher.firstName} {slot.teacher.lastName}</span>
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
              <span className="badge badge-warning">2 Scheduled</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#fefce8", border: "1px solid #fef08a" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#854d0e" }}>
                  JEE Weekly Mock Test #4
                </div>
                <div style={{ fontSize: "0.75rem", color: "#a16207", marginTop: "0.25rem" }}>
                  📅 Saturday, 10:00 AM • 3 Hours • 300 Marks
                </div>
              </div>
              <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Physics Mechanics Sectional
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  📅 Next Tuesday, 04:00 PM • 1 Hour
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: "1rem" }}>Announcements</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <AlertCircle size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Study Notes Uploaded</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                    Electrodynamics Chapter 4 notes are now available in Study Materials.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Fee Receipt Issued</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                    Q2 installment receipt is available for download.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
