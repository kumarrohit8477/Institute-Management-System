import React, { useState, useEffect } from "react";
import { AdminApiService, AdminTimetableSlot } from "../../services/adminApi";
import { Calendar, Clock, MapPin, Video, PlusCircle } from "lucide-react";

export const AdminTimetablePage: React.FC = () => {
  const [timetables, setTimetables] = useState<AdminTimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");
  const [loading, setLoading] = useState<boolean>(true);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  useEffect(() => {
    const loadTimetables = async () => {
      setLoading(true);
      try {
        const data = await AdminApiService.getTimetables();
        if (data && data.length > 0) {
          setTimetables(data);
        } else {
          setTimetables([
            {
              id: "tim-1",
              batchId: "bat-1",
              subjectId: "sub-1",
              teacherId: "tea-1",
              dayOfWeek: "MONDAY",
              startTime: "09:00 AM",
              endTime: "10:30 AM",
              roomNumber: "LH-101",
              meetingLink: "https://meet.google.com/xyz-ims-demo",
              subject: { name: "Physics Mechanics" },
              teacher: { firstName: "Dr. Harish", lastName: "Verma" },
            },
            {
              id: "tim-2",
              batchId: "bat-1",
              subjectId: "sub-2",
              teacherId: "tea-2",
              dayOfWeek: "MONDAY",
              startTime: "11:00 AM",
              endTime: "12:30 PM",
              roomNumber: "LH-102",
              subject: { name: "Mathematics Calculus" },
              teacher: { firstName: "Prof. Sunita", lastName: "Ramanujan" },
            },
            {
              id: "tim-3",
              batchId: "bat-1",
              subjectId: "sub-1",
              teacherId: "tea-1",
              dayOfWeek: "WEDNESDAY",
              startTime: "09:00 AM",
              endTime: "10:30 AM",
              roomNumber: "LH-101",
              subject: { name: "Electrodynamics" },
              teacher: { firstName: "Dr. Harish", lastName: "Verma" },
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTimetables();
  }, []);

  const currentSlots = timetables.filter((t) => t.dayOfWeek === selectedDay);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Timetable & Lecture Scheduling</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Configure classroom allocations, faculty slots, and online meeting links.
        </p>
      </div>

      {/* Day Selector Pills */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSelectedDay(d)}
            className={`btn ${selectedDay === d ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}
          >
            {d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentSlots.length > 0 ? (
            currentSlots.map((slot) => (
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
                  gap: "0.75rem",
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
                      textAlign: "center",
                    }}
                  >
                    <Clock size={16} style={{ marginBottom: "2px" }} />
                    <div>{slot.startTime}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {slot.subject?.name || "Subject Lecture"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      <span>👨‍🏫 {slot.teacher?.firstName} {slot.teacher?.lastName}</span>
                      {slot.roomNumber && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <MapPin size={12} /> Room {slot.roomNumber}
                        </span>
                      )}
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
                    <span className="badge badge-gray">In-Person</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--color-text-muted)" }}>
              <Calendar size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
              <div>No scheduled lectures for {selectedDay}.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
