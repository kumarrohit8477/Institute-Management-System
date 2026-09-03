import React, { useState, useEffect } from "react";
import { AdminApiService, AdminBatch } from "@/src/services/adminApi";
import { CheckCircle2, TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminAttendancePage: React.FC = () => {
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadBatches = async () => {
      setLoading(true);
      try {
        const data = await AdminApiService.getBatches();
        if (Array.isArray(data)) {
          setBatches(data);
        } else {
          setBatches([]);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to load batches for attendance tracking.");
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Attendance Tracking</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Batch-wise attendance summaries, logged cohorts, and enrolled student rosters.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
          Loading attendance records from database...
        </div>
      ) : batches.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <AlertCircle size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Batches Found</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Create academic batches in the system to begin logging and tracking student attendance.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {batches.map((b) => {
            const studentCount = b._count?.students ?? b.students?.length ?? 0;
            const maxCap = b.maxStrength || b.maxCapacity || 60;
            return (
              <div key={b.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="badge badge-primary">{b.code}</span>
                  <span className={`badge ${b.status === "ACTIVE" ? "badge-success" : "badge-gray"}`}>
                    {b.status}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {b.name}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                    {studentCount}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    / {maxCap} Students Enrolled
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Academic Session: {b.academicSession || "Current"} • {b.course?.name || "Program"}
                </p>
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    Started: {b.startDate ? new Date(b.startDate).toLocaleDateString() : "N/A"}
                  </span>
                  <Link to={`/admin/batches/${b.id}`} className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    Manage Roster & Attendance →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
