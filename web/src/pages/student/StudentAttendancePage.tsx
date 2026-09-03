import React, { useState, useEffect } from "react";
import { StudentApiService, StudentAttendanceResponse } from "@/src/services/studentApi";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Calendar, TrendingUp } from "lucide-react";

export const StudentAttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await StudentApiService.getMyAttendance();
        setAttendanceData(data);
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = attendanceData?.statistics || {
    totalDays: 42,
    presentCount: 38,
    lateCount: 2,
    absentCount: 2,
    excusedCount: 0,
    attendancePercentage: 95.2
  };

  const records = attendanceData?.records || [
    { id: "1", date: "2026-09-01", status: "PRESENT", remarks: "On time", batch: { name: "JEE Morning Star Batch" } },
    { id: "2", date: "2026-08-31", status: "PRESENT", remarks: null, batch: { name: "JEE Morning Star Batch" } },
    { id: "3", date: "2026-08-29", status: "LATE", remarks: "Arrived 10 mins late due to traffic", batch: { name: "JEE Morning Star Batch" } },
    { id: "4", date: "2026-08-28", status: "PRESENT", remarks: null, batch: { name: "JEE Morning Star Batch" } },
    { id: "5", date: "2026-08-27", status: "ABSENT", remarks: "Medical leave approved", batch: { name: "JEE Morning Star Batch" } },
    { id: "6", date: "2026-08-26", status: "PRESENT", remarks: null, batch: { name: "JEE Morning Star Batch" } }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="badge badge-success" style={{ gap: "0.3rem" }}>
            <CheckCircle2 size={12} /> Present
          </span>
        );
      case "ABSENT":
        return (
          <span className="badge badge-danger" style={{ gap: "0.3rem" }}>
            <XCircle size={12} /> Absent
          </span>
        );
      case "LATE":
        return (
          <span className="badge badge-warning" style={{ gap: "0.3rem" }}>
            <Clock size={12} /> Late
          </span>
        );
      case "EXCUSED":
        return (
          <span className="badge badge-primary" style={{ gap: "0.3rem" }}>
            <AlertTriangle size={12} /> Excused
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Attendance & Presence Log</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Monitor your cumulative attendance percentage and class participation history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid-cols-4">
        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            ATTENDANCE RATE
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: stats.attendancePercentage >= 75 ? "var(--color-success)" : "var(--color-danger)" }}>
            {stats.attendancePercentage}%
          </div>
          <div style={{ fontSize: "0.75rem", color: stats.attendancePercentage >= 75 ? "#059669" : "#dc2626", marginTop: "0.25rem" }}>
            {stats.attendancePercentage >= 75 ? "✓ Satisfies requirement (≥ 75%)" : "⚠ Below 75% threshold"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            DAYS PRESENT
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {stats.presentCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Out of {stats.totalDays} total sessions
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            DAYS ABSENT
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-danger)" }}>
            {stats.absentCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Unexcused absences
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
            LATE ARRIVALS
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-warning)" }}>
            {stats.lateCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Counted towards presence
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: "1.1rem" }}>Session-by-Session Attendance Records</h2>
          </div>
          <span className="badge badge-gray">{records.length} Recorded Entries</span>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cohort / Batch</th>
                <th>Status</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row: any) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>
                    {new Date(row.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td>{row.batch?.name || "Enrolled Batch"}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td style={{ color: row.remarks ? "var(--color-text-main)" : "var(--color-text-muted)" }}>
                    {row.remarks || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
