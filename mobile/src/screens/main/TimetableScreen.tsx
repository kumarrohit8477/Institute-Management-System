import React, { useState, useEffect } from "react";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const TimetableScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getSchedule().then(setSchedule).catch(console.warn);
  }, []);

  const daySlots = schedule?.scheduleByDay?.[selectedDay] || [
    {
      id: "1",
      startTime: "09:00",
      endTime: "10:30",
      subject: { name: "Physics" },
      teacher: { firstName: "Dr. Harish", lastName: "Verma" },
      roomNumber: "LH-101",
      classType: "OFFLINE"
    },
    {
      id: "2",
      startTime: "11:00",
      endTime: "12:30",
      subject: { name: "Mathematics" },
      teacher: { firstName: "Prof. Sunita", lastName: "Ramanujan" },
      meetingLink: "https://meet.google.com/demo",
      classType: "ONLINE"
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Class Timetable" subtitle="Weekly schedule & links" onBack={onBack} />

      {/* Weekday Switcher */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: selectedDay === d ? "#3b82f6" : "#ffffff",
              color: selectedDay === d ? "#ffffff" : "#475569",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {daySlots.map((slot: any) => (
        <Card key={slot.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{slot.subject.name}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                👨‍🏫 {slot.teacher.firstName} {slot.teacher.lastName} {slot.roomNumber ? `• Room ${slot.roomNumber}` : ""}
              </div>
            </div>
            <Badge label={slot.classType} variant={slot.classType === "ONLINE" ? "primary" : "gray"} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#3b82f6" }}>
              ⏰ {slot.startTime} - {slot.endTime}
            </span>
            {slot.meetingLink ? (
              <a
                href={slot.meetingLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                Join Video
              </a>
            ) : (
              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700 }}>In-Person</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export const MaterialsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    MobileStudentService.getMaterials({ search })
      .then((res) => setMaterials(res.materials || []))
      .catch(console.warn);
  }, [search]);

  const sampleList = materials.length > 0 ? materials : [
    {
      id: "1",
      title: "Electrodynamics Lecture Notes",
      fileType: "PDF",
      fileUrl: "https://example.com/notes.pdf",
      subject: { name: "Physics" }
    },
    {
      id: "2",
      title: "Differential Calculus Video Class",
      fileType: "VIDEO",
      fileUrl: "https://youtube.com/watch?v=demo",
      subject: { name: "Mathematics" }
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Study Materials" subtitle="Notes, PDFs & Videos" onBack={onBack} />

      <input
        type="text"
        placeholder="Search notes & documents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          fontSize: "13px",
          outline: "none"
        }}
      />

      {sampleList.map((m: any) => (
        <Card key={m.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <Badge label={m.subject.name} variant="primary" />
            <Badge label={m.fileType} variant="gray" />
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px", margin: "6px 0", color: "#0f172a" }}>
            {m.title}
          </div>
          <a
            href={m.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#eff6ff",
              color: "#3b82f6",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 700,
              textDecoration: "none",
              marginTop: "4px"
            }}
          >
            {m.fileType === "VIDEO" ? "▶ Watch Video" : "📥 Open Document"}
          </a>
        </Card>
      ))}
    </div>
  );
};

export const AttendanceScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [attData, setAttData] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAttendance().then(setAttData).catch(console.warn);
  }, []);

  const stats = attData?.statistics || {
    attendancePercentage: 95.2,
    presentCount: 38,
    absentCount: 2,
    totalDays: 40
  };

  const records = attData?.records || [
    { id: "1", date: "2026-09-01", status: "PRESENT", batch: { name: "JEE Morning Star" } },
    { id: "2", date: "2026-08-31", status: "PRESENT", batch: { name: "JEE Morning Star" } },
    { id: "3", date: "2026-08-29", status: "LATE", batch: { name: "JEE Morning Star" } },
    { id: "4", date: "2026-08-27", status: "ABSENT", batch: { name: "JEE Morning Star" } }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Attendance" subtitle="Presence logs & percentage" onBack={onBack} />

      <Card>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Overall Attendance</div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: stats.attendancePercentage >= 75 ? "#10b981" : "#ef4444", margin: "4px 0" }}>
            {stats.attendancePercentage}%
          </div>
          <div style={{ fontSize: "12px", color: "#475569" }}>
            {stats.presentCount} Days Present / {stats.totalDays} Sessions Total
          </div>
        </div>
      </Card>

      <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>Daily Logs</div>

      {records.map((r: any) => (
        <Card key={r.id} style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px" }}>{new Date(r.date).toLocaleDateString()}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{r.batch?.name}</div>
            </div>
            <Badge
              label={r.status}
              variant={r.status === "PRESENT" ? "success" : r.status === "ABSENT" ? "danger" : "warning"}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};
