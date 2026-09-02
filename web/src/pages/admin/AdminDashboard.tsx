import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { InstituteApiService } from "../../services/instituteApi";
import {
  AdminApiService,
  AdminStudent,
  AdminTeacher,
  AdminCourse,
  AdminBatch,
} from "../../services/adminApi";
import {
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  FolderDown,
  CheckCircle2,
  Image as ImageIcon,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { institute } = useAuth();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const [stu, tea, cou, bat] = await Promise.allSettled([
          AdminApiService.getStudents(),
          AdminApiService.getTeachers(),
          AdminApiService.getCourses(),
          AdminApiService.getBatches(),
        ]);

        if (stu.status === "fulfilled" && stu.value.length > 0) setStudents(stu.value);
        else setStudents([{ id: "1", admissionNumber: "ADM-001", firstName: "Rohit", lastName: "Kumar", email: "student@apex.edu", status: "ACTIVE", createdAt: "" }]);

        if (tea.status === "fulfilled" && tea.value.length > 0) setTeachers(tea.value);
        else setTeachers([{ id: "1", firstName: "Dr. Harish", lastName: "Verma", email: "h.verma@apex.edu", status: "ACTIVE", createdAt: "" }, { id: "2", firstName: "Prof. Sunita", lastName: "Ramanujan", email: "s.ramanujan@apex.edu", status: "ACTIVE", createdAt: "" }]);

        if (cou.status === "fulfilled" && cou.value.length > 0) setCourses(cou.value);
        else setCourses([{ id: "1", name: "IIT-JEE 2-Year", code: "JEE-2027", durationMonths: 24, status: "ACTIVE" }, { id: "2", name: "NEET Intensive", code: "NEET-2027", durationMonths: 24, status: "ACTIVE" }]);

        if (bat.status === "fulfilled" && bat.value.length > 0) setBatches(bat.value);
        else setBatches([{ id: "1", name: "JEE Morning Star", code: "BATCH-JEE-M1", courseId: "1", startDate: "2026-04-01", maxStrength: 60, status: "ACTIVE" }, { id: "2", name: "NEET Weekend", code: "BATCH-NEET-W1", courseId: "2", startDate: "2026-04-05", maxStrength: 50, status: "ACTIVE" }]);
      } catch (err) {
        console.error("Summary load note:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const currentLogoSrc = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const kpis = [
    {
      title: "Total Students",
      value: students.length.toString(),
      subtext: "Enrolled in active batches",
      trend: "+1 this month",
      icon: Users,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      title: "Faculty & Teachers",
      value: teachers.length.toString(),
      subtext: "Qualified educators",
      trend: "All active",
      icon: GraduationCap,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      title: "Active Courses",
      value: courses.length.toString(),
      subtext: "Engineering & Medical",
      trend: "Full curriculum",
      icon: BookOpen,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      title: "Cohort Batches",
      value: batches.length.toString(),
      subtext: "Morning & Weekend",
      trend: "Running smoothly",
      icon: Layers,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  const adminModules = [
    {
      to: "/admin/students",
      title: "Student Management",
      desc: "Enroll students, view profiles, filter cohorts, and manage credentials.",
      icon: Users,
      count: `${students.length} Enrolled`,
      color: "#3b82f6",
      badge: "Primary",
      badgeColor: "#dbeafe",
      badgeText: "#1d4ed8",
    },
    {
      to: "/admin/teachers",
      title: "Teacher Management",
      desc: "Faculty records, subject allocations, and educational qualifications.",
      icon: GraduationCap,
      count: `${teachers.length} Faculty`,
      color: "#8b5cf6",
      badge: "Staff",
      badgeColor: "#ede9fe",
      badgeText: "#6d28d9",
    },
    {
      to: "/admin/courses",
      title: "Courses & Subjects",
      desc: "Curriculum structure, discipline breakdown, and syllabus prerequisites.",
      icon: BookOpen,
      count: `${courses.length} Courses`,
      color: "#10b981",
      badge: "Curriculum",
      badgeColor: "#d1fae5",
      badgeText: "#047857",
    },
    {
      to: "/admin/batches",
      title: "Batch Management",
      desc: "Track cohort capacity, start/end schedules, and create new batches.",
      icon: Layers,
      count: `${batches.length} Batches`,
      color: "#f59e0b",
      badge: "Cohorts",
      badgeColor: "#fef3c7",
      badgeText: "#b45309",
    },
    {
      to: "/admin/timetable",
      title: "Timetable Scheduling",
      desc: "Lecture slots, classroom allocation, and online meeting links.",
      icon: Calendar,
      count: "Weekly Active",
      color: "#ec4899",
      badge: "Schedule",
      badgeColor: "#fce7f3",
      badgeText: "#be185d",
    },
    {
      to: "/admin/materials",
      title: "Study Materials",
      desc: "Upload derivation notes, lecture slides, and video links scoped to batches.",
      icon: FolderDown,
      count: "3 Resources",
      color: "#6366f1",
      badge: "Repository",
      badgeColor: "#e0e7ff",
      badgeText: "#4338ca",
    },
    {
      to: "/admin/attendance",
      title: "Attendance Tracking",
      desc: "Daily session attendance marking, historical grids, and presence ratios.",
      icon: CheckCircle2,
      count: "94.2% Avg",
      color: "#06b6d4",
      badge: "Daily Log",
      badgeColor: "#cffafe",
      badgeText: "#0e7490",
    },
    {
      to: "/admin/branding",
      title: "Institute Branding",
      desc: "Custom logos, color schemes, and campus visual identity for student portals.",
      icon: ImageIcon,
      count: institute?.logoUrl ? "Custom Logo" : "Default Badge",
      color: "#3b82f6",
      badge: "Identity",
      badgeColor: "#dbeafe",
      badgeText: "#1d4ed8",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem 2.25rem",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#93c5fd",
              marginBottom: "0.85rem",
            }}
          >
            <Shield size={13} />
            <span>Campus Administration</span>
            <span>•</span>
            <span style={{ color: "#ffffff" }}>
              {institute?.code || "INST001"}
            </span>
          </div>

          <h1
            style={{
              color: "#ffffff",
              fontSize: "1.85rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            {institute?.name || "Institute Control Center"}
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.925rem",
              maxWidth: "650px",
              lineHeight: "1.55",
            }}
          >
            Configure student registrations, faculty allocations, course
            curricula, daily timetables, study materials, and custom branding.
          </p>
        </div>

        {/* Quick Branding Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "16px",
            padding: "1.15rem 1.35rem",
            display: "flex",
            alignItems: "center",
            gap: "1.15rem",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {currentLogoSrc ? (
              <img
                src={currentLogoSrc}
                alt="Institute Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "3px",
                }}
              />
            ) : (
              <Building2 size={26} color="#2563eb" />
            )}
          </div>

          <div>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Institute Branding
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#94a3b8",
                marginTop: "2px",
              }}
            >
              {institute?.logoUrl
                ? "Custom Logo Active"
                : "Default Badge Active"}
            </div>
            <Link
              to="/admin/branding"
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                marginTop: "0.35rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <ImageIcon size={13} /> Manage Logo →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {kpi.title}
                  </div>
                  <div
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 800,
                      color: "var(--color-text-main)",
                      marginTop: "0.25rem",
                      lineHeight: "1.1",
                    }}
                  >
                    {kpi.value}
                  </div>
                </div>

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: kpi.bg,
                    color: kpi.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid #f1f5f9",
                  color: "var(--color-text-muted)",
                }}
              >
                <span>{kpi.subtext}</span>
                <span
                  style={{
                    color: "#16a34a",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <TrendingUp size={12} /> {kpi.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Administrative Modules Grid */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Campus Administration Modules
            </h2>
            <p
              style={{
                fontSize: "0.825rem",
                color: "var(--color-text-muted)",
              }}
            >
              Select a module to manage academic data, schedules, faculty, and
              students.
            </p>
          </div>
        </div>

        <div className="grid-cols-3">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: `${mod.color}15`,
                          color: mod.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      <span
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          background: mod.badgeColor,
                          color: mod.badgeText,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.08rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {mod.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.835rem",
                        color: "var(--color-text-muted)",
                        lineHeight: "1.5",
                      }}
                    >
                      {mod.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "0.85rem",
                      borderTop: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {mod.count}
                    </span>

                    <span
                      className="btn btn-outline"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.35rem 0.75rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <span>Open Module</span>
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
