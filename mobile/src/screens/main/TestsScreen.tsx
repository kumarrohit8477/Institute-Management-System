import React, { useState, useEffect } from "react";
import { MobileExamService } from "../../services/examService";
import { Header, Card, Badge, Button } from "../../components/Header";

export const TestsScreen: React.FC<{ onNavigate: (screen: string, params?: any) => void; onBack?: () => void }> = ({
  onNavigate,
  onBack
}) => {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    MobileExamService.getTests().then(setTests).catch(console.warn);
  }, []);

  const sampleTests = tests.length > 0 ? tests : [
    {
      id: "test-jee-01",
      title: "JEE Main All-India Grand Mock Test 1",
      durationMinutes: 180,
      totalMarks: 300,
      passingMarks: 100,
      isPublished: true,
      myAttempt: null
    },
    {
      id: "test-phy-02",
      title: "Physics Mechanics Sectional Quiz",
      durationMinutes: 60,
      totalMarks: 100,
      passingMarks: 35,
      isPublished: true,
      myAttempt: null
    }
  ];

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Online Examinations" subtitle="Competitive tests & quizzes" onBack={onBack} />

      {sampleTests.map((t: any) => {
        const isEvaluated = t.myAttempt?.status === "EVALUATED" || t.myAttempt?.status === "SUBMITTED";

        return (
          <Card key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <Badge label="CBT Online" variant="primary" />
              {isEvaluated && <Badge label={`Score: ${t.myAttempt?.score}`} variant="success" />}
            </div>

            <div style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>
              {t.title}
            </div>

            <div style={{ fontSize: "11px", color: "#64748b", display: "flex", gap: "12px", marginBottom: "12px" }}>
              <span>⏱ {t.durationMinutes} Mins</span>
              <span>•</span>
              <span>🎯 Marks: {t.totalMarks} (Pass: {t.passingMarks})</span>
            </div>

            <Button
              title={isEvaluated ? "View Scorecard" : "Start Test Attempt"}
              variant={isEvaluated ? "outline" : "primary"}
              onClick={() => onNavigate(isEvaluated ? "result" : "attempt", { testId: t.id })}
            />
          </Card>
        );
      })}
    </div>
  );
};
