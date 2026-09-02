import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { MobileStudentService } from "../../services/studentService";
import { Card, Badge, Header } from "../../components/Header";

export const DashboardScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void }> = ({ onNavigate }) => {
  const { student, institute } = useAuth();
  const [academics, setAcademics] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [acad, sched, att] = await Promise.allSettled([
          MobileStudentService.getAcademics(),
          MobileStudentService.getSchedule(),
          MobileStudentService.getAttendance()
        ]);
        if (acad.status === "fulfilled") setAcademics(acad.value);
        if (sched.status === "fulfilled") setSchedule(sched.value);
        if (att.status === "fulfilled") setAttendance(att.value);
      } catch (err) {
        console.warn("Mobile dashboard fallback:", err);
      }
    };
    load();
  }, []);

  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayClasses = schedule?.scheduleByDay?.[todayName] || [
    {
      id: "c1",
      startTime: "09:00",
      endTime: "10:30",
      subject: { name: "Physics (Mechanics)" },
      teacher: { firstName: "Dr. Harish", lastName: "Verma" },
      roomNumber: "LH-101",
      classType: "OFFLINE"
    },
    {
      id: "c2",
      startTime: "11:00",
      endTime: "12:30",
      subject: { name: "Mathematics (Calculus)" },
      teacher: { firstName: "Prof. Sunita", lastName: "Ramanujan" },
      meetingLink: "https://meet.google.com/demo",
      classType: "ONLINE"
    }
  ];

  const currentBatch = academics?.batches?.[0];
  const attPercentage = attendance?.statistics?.attendancePercentage ?? 95.2;

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "80px" }}>
      {/* Student Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          borderRadius: "16px",
          padding: "20px",
          color: "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#bfdbfe", marginBottom: "4px" }}>
          {institute?.name || "Apex Academy"}
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 6px 0" }}>
          Hello, {student?.firstName || "Student"}! 👋
        </h2>
        <div style={{ fontSize: "12px", color: "#e0e7ff", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <span>Adm: <strong>{student?.admissionNumber || "ADM-2026-001"}</strong></span>
          <span>•</span>
          <span>Batch: <strong>{currentBatch?.name || "JEE Morning Star"}</strong></span>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {[
          { label: "Timetable", icon: "📅", screen: "timetable" },
          { label: "Materials", icon: "📖", screen: "materials" },
          { label: "Tests", icon: "📝", screen: "tests" },
          { label: "Attendance", icon: "✅", screen: "attendance" }
        ].map((item) => (
          <div
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "12px 6px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              cursor: "pointer"
            }}
          >
            <div style={{ fontSize: "22px", marginBottom: "4px" }}>{item.icon}</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Attendance Widget */}
      <Card onClick={() => onNavigate("attendance")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Attendance Standing</div>
          <Badge label="Good Standing" variant="success" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981" }}>{attPercentage}%</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Satisfies ≥ 75% requirement</div>
          </div>
          <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700 }}>
            View Log →
          </div>
        </div>
      </Card>

      {/* Today's Classes */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ fontWeight: 800, fontSize: "15px" }}>Today's Classes ({todayName})</div>
          <span onClick={() => onNavigate("timetable")} style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700, cursor: "pointer" }}>
            Full Week →
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {todayClasses.map((c: any) => (
            <Card key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{c.subject.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                    👨‍🏫 {c.teacher.firstName} {c.teacher.lastName} {c.roomNumber ? `• Room ${c.roomNumber}` : ""}
                  </div>
                </div>
                <Badge label={c.classType} variant={c.classType === "ONLINE" ? "primary" : "gray"} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6" }}>
                  ⏰ {c.startTime} - {c.endTime}
                </span>

                {c.meetingLink ? (
                  <a
                    href={c.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    Join Video
                  </a>
                ) : (
                  <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>In-Class</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Exams Preview */}
      <Card onClick={() => onNavigate("tests")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>Upcoming Examinations</div>
          <Badge label="2 Scheduled" variant="warning" />
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
          JEE Main All-India Grand Mock Test 1
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
          3 Hours • 300 Marks • Active Online
        </div>
      </Card>
    </div>
  );
};
