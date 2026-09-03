import React, { useState, useEffect } from "react";
import { StudentApiService, StudentAcademics } from "@/src/services/studentApi";
import { Layers, GraduationCap, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const MySubjectsPage: React.FC = () => {
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

  const subjects = academics?.subjects || [
    {
      id: "1",
      name: "Physics (Mechanics, Electrodynamics & Optics)",
      code: "PHY-JEE",
      description: "Classical dynamics, wave theory, electrostatics, current electricity, magnetism, and ray optics.",
      teachers: [{ firstName: "Dr. Harish", lastName: "Verma", employeeCode: "FAC-2026-0001", specialization: "Applied Physics" }]
    },
    {
      id: "2",
      name: "Mathematics (Calculus & Algebra)",
      code: "MATH-JEE",
      description: "Differential & integral calculus, coordinate geometry, vectors, matrices, and permutation combinations.",
      teachers: [{ firstName: "Prof. Sunita", lastName: "Ramanujan", employeeCode: "FAC-2026-0002", specialization: "Higher Mathematics" }]
    },
    {
      id: "3",
      name: "Chemistry (Organic, Inorganic & Physical)",
      code: "CHEM-JEE",
      description: "Reaction mechanisms, periodic trends, chemical kinetics, coordination chemistry, and thermodynamics.",
      teachers: [{ firstName: "Dr. Arvind", lastName: "Shukla", employeeCode: "FAC-2026-0003", specialization: "Physical Chemistry" }]
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>My Subjects</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Curriculum disciplines, subject descriptions, and assigned subject professors.
        </p>
      </div>

      <div className="grid-cols-3">
        {subjects.map((subj) => (
          <div key={subj.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Layers size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{subj.code}</span>
                </div>
                <span className="badge badge-primary">Active</span>
              </div>

              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                {subj.name}
              </h3>

              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: "1.5", marginBottom: "1rem" }}>
                {subj.description || "Core discipline syllabus aligned with competitive examination standards."}
              </p>
            </div>

            <div>
              {/* Faculty Info */}
              <div style={{ padding: "0.75rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <GraduationCap size={14} /> Assigned Faculty:
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {subj.teachers?.[0] ? `${subj.teachers[0].firstName} ${subj.teachers[0].lastName}` : "Faculty Assigned"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {subj.teachers?.[0]?.specialization || "Senior Faculty"}
                </div>
              </div>

              <Link
                to={`/student/materials?subjectId=${subj.id}`}
                className="btn btn-outline"
                style={{ width: "100%", fontSize: "0.8rem", padding: "0.45rem" }}
              >
                <BookOpen size={14} /> View Study Materials <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
