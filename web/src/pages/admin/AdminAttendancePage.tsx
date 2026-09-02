import React from "react";
import { CheckCircle2, TrendingUp, Users, Calendar } from "lucide-react";

export const AdminAttendancePage: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Attendance Tracking</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Batch-wise attendance summaries, logged sessions, and daily presence ratios.
        </p>
      </div>

      <div className="grid-cols-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <span className="badge badge-primary">BATCH-JEE-M1</span>
            <span className="badge badge-success">High Presence</span>
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            JEE Morning Star Batch
          </h3>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#16a34a",
              marginBottom: "0.25rem",
            }}
          >
            94.2%
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            38 / 40 Registered sessions logged Present.
          </p>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <span className="badge badge-warning">BATCH-NEET-W1</span>
            <span className="badge badge-success">Steady</span>
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            NEET Weekend Achievers
          </h3>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#2563eb",
              marginBottom: "0.25rem",
            }}
          >
            91.8%
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            22 / 24 Registered sessions logged Present.
          </p>
        </div>
      </div>
    </div>
  );
};
