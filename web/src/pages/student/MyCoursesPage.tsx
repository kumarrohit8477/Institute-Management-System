import React, { useState, useEffect } from "react";
import { StudentApiService, StudentAcademics } from "@/src/services/studentApi";
import { BookOpen, Calendar, Clock, Layers, Users, CheckCircle2 } from "lucide-react";

export const MyCoursesPage: React.FC = () => {
  const [academics, setAcademics] = useState<StudentAcademics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await StudentApiService.getMyAcademics();
        setAcademics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const courses = academics?.courses || [
    {
      id: "1",
      name: "IIT-JEE 2-Year Advanced Program",
      code: "JEE-2027",
      description: "Intensive 2-year preparation for JEE Main and JEE Advanced engineering entrance examinations.",
      durationMonths: 24,
      status: "ACTIVE"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>My Enrolled Courses</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Explore your active educational programs, curriculum structure, and cohort details.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {courses.map((course) => (
          <div key={course.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{course.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                    <span className="badge badge-primary">{course.code}</span>
                    <span className="badge badge-success">Enrolled</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Clock size={16} /> {course.durationMonths || 24} Months Duration
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Layers size={16} /> {academics?.subjects?.length || 3} Core Subjects
                </div>
              </div>
            </div>

            <p style={{ color: "var(--color-text-main)", fontSize: "0.925rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              {course.description || "Comprehensive foundational and advanced concept coverage with systematic assignments, regular test series, and mentorship."}
            </p>

            {/* Enrolled Batches */}
            <div style={{ background: "#f8fafc", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Users size={16} color="var(--color-primary)" /> Enrolled Cohort / Batch
              </div>

              {(academics?.batches || [
                { name: "JEE Morning Star Batch", code: "BATCH-JEE-M1", rollNumber: "JEE-M1-01", startDate: "2026-04-01", endDate: "2028-03-31", status: "ACTIVE" }
              ]).map((batch, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{batch.name}</span> <span style={{ color: "var(--color-text-muted)" }}>({batch.code})</span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span>Roll No: <strong>{batch.rollNumber || "JEE-M1-01"}</strong></span>
                    <span className="badge badge-success"><CheckCircle2 size={12} /> {batch.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
