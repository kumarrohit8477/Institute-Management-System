import React, { useState, useEffect } from "react";
import { MobileStudentService } from "../../services/studentService";
import { Header, Card, Badge } from "../../components/Header";

export const CoursesScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [academics, setAcademics] = useState<any>(null);

  useEffect(() => {
    MobileStudentService.getAcademics().then(setAcademics).catch(console.warn);
  }, []);

  const courses = academics?.courses || [
    {
      id: "1",
      name: "IIT-JEE 2-Year Advanced Program",
      code: "JEE-2027",
      description: "Intensive 2-year preparation for JEE Main & Advanced.",
      durationMonths: 24
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="My Courses" subtitle="Enrolled academic programs" onBack={onBack} />

      {courses.map((c: any) => (
        <Card key={c.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{c.name}</span>
            <Badge label={c.code} variant="primary" />
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5", margin: "0 0 10px 0" }}>
            {c.description}
          </p>
          <div style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700 }}>
            ⏳ Duration: {c.durationMonths || 24} Months • Status: Active
          </div>
        </Card>
      ))}
    </div>
  );
};
