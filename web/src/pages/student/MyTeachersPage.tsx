import React, { useState, useEffect } from "react";
import { StudentApiService, StudentAcademics } from "@/src/services/studentApi";
import { GraduationCap, Mail, Phone, Award, BookOpen, AlertCircle } from "lucide-react";

export const MyTeachersPage: React.FC = () => {
  const [academics, setAcademics] = useState<StudentAcademics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await StudentApiService.getMyAcademics();
        setAcademics(data);
      } catch (err) {
        console.error("Failed to load teachers from database:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const teachers = academics?.teachers || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>My Teachers & Faculty</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Distinguished professors and mentors guiding your batch across academic subjects.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
          Loading faculty records from database...
        </div>
      ) : teachers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <AlertCircle size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Assigned Faculty</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No instructors are currently assigned to your enrolled subjects in the database.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="card">
              <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {teacher.firstName?.[0]}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span className="badge badge-gray">{teacher.employeeCode}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    <BookOpen size={16} /> {teacher.subjectName || "Assigned Faculty"}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <GraduationCap size={15} /> <strong>Qualification:</strong> {teacher.qualification || "Faculty Member"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Award size={15} /> <strong>Specialization:</strong> {teacher.specialization || "General Domain"}
                    </div>
                    {teacher.experienceYears !== undefined && (
                      <div>
                        <strong>Experience:</strong> {teacher.experienceYears} Years
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {teacher.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Mail size={14} /> {teacher.email}
                      </div>
                    )}
                    {teacher.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Phone size={14} /> {teacher.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
