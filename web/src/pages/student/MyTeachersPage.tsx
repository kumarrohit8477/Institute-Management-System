import React, { useState, useEffect } from "react";
import { StudentApiService, StudentAcademics } from "@/src/services/studentApi";
import { GraduationCap, Mail, Phone, Award, BookOpen } from "lucide-react";

export const MyTeachersPage: React.FC = () => {
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

  const teachers = academics?.teachers || [
    {
      id: "1",
      employeeCode: "FAC-2026-0001",
      firstName: "Dr. Harish",
      lastName: "Verma",
      email: "hverma.physics@apexacademy.local",
      phone: "+91 9845012345",
      qualification: "Ph.D. in Applied Physics, IIT Kanpur",
      specialization: "Quantum Mechanics & Classical Dynamics",
      experienceYears: 14.5,
      subjectName: "Physics (Mechanics, Electrodynamics & Optics)"
    },
    {
      id: "2",
      employeeCode: "FAC-2026-0002",
      firstName: "Prof. Sunita",
      lastName: "Ramanujan",
      email: "sramanujan.math@apexacademy.local",
      phone: "+91 9845067890",
      qualification: "M.Sc Mathematics, Gold Medalist",
      specialization: "Differential Calculus & Coordinate Geometry",
      experienceYears: 11.0,
      subjectName: "Mathematics (Calculus & Algebra)"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>My Teachers & Faculty</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Distinguished professors and mentors guiding your batch across academic subjects.
        </p>
      </div>

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
                  <BookOpen size={16} /> {teacher.subjectName || "Core Faculty"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <GraduationCap size={15} /> <strong>Qualification:</strong> {teacher.qualification || "Ph.D."}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Mail size={14} /> {teacher.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Phone size={14} /> {teacher.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
