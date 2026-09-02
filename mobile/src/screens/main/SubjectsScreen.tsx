import React, { useState, useEffect } from "react";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const SubjectsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const subjects = academics?.subjects || [
    { id: "1", name: "Physics", code: "PHY-JEE", description: "Mechanics, Electrodynamics & Ray Optics." },
    { id: "2", name: "Mathematics", code: "MATH-JEE", description: "Calculus, Coordinate Geometry & Vectors." },
    { id: "3", name: "Chemistry", code: "CHEM-JEE", description: "Organic, Inorganic & Physical Chemistry." }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="My Subjects" subtitle="Course curriculum disciplines" onBack={onBack} />

      {subjects.map((s: any) => (
        <Card key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{s.name}</span>
            <Badge label={s.code} variant="primary" />
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4", margin: 0 }}>
            {s.description}
          </p>
        </Card>
      ))}
    </div>
  );
};

export const TeachersScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const teachers = academics?.teachers || [
    {
      id: "1",
      firstName: "Dr. Harish",
      lastName: "Verma",
      qualification: "Ph.D. IIT Kanpur",
      specialization: "Quantum & Classical Mechanics",
      subjectName: "Physics"
    },
    {
      id: "2",
      firstName: "Prof. Sunita",
      lastName: "Ramanujan",
      qualification: "M.Sc Gold Medalist",
      specialization: "Calculus & Geometry",
      subjectName: "Mathematics"
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Faculty Directory" subtitle="My Teachers & Mentors" onBack={onBack} />

      {teachers.map((t: any) => (
        <Card key={t.id}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px"
              }}
            >
              {t.firstName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
                {t.firstName} {t.lastName}
              </div>
              <div style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700 }}>
                {t.subjectName} • {t.qualification}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                {t.specialization}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
