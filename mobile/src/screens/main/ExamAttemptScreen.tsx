import React, { useState, useEffect } from "react";
import { MobileExamService } from "../../services/examService";
import { Header, Card, Badge, Button } from "../../components/Header";

export const ExamAttemptScreen: React.FC<{
  testId?: string;
  onFinish: (testId: string) => void;
  onBack?: () => void;
}> = ({ testId = "test-jee-01", onFinish, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(180 * 60);

  const sampleQuestions = [
    {
      id: "q1",
      questionText: "A particle is projected vertically upwards with velocity u. The ratio of time taken to reach half of the maximum height to the total time to reach the maximum height is:",
      type: "SINGLE_CHOICE",
      marks: 4,
      options: [
        { id: "opt1", text: "1 - 1/√2" },
        { id: "opt2", text: "1 / √2" },
        { id: "opt3", text: "1 - √2" },
        { id: "opt4", text: "√2 - 1" }
      ]
    },
    {
      id: "q2",
      questionText: "Which of the following are TRUE regarding conservative electrostatic fields?",
      type: "MULTIPLE_CHOICE",
      marks: 4,
      options: [
        { id: "opt5", text: "Line integral over closed loop is zero" },
        { id: "opt6", text: "Field lines never form closed loops" },
        { id: "opt7", text: "Curl of field is non-zero" },
        { id: "opt8", text: "Work is path-independent" }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const currentQ = sampleQuestions[currentIdx];

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: [optId]
    }));
  };

  const handleSubmit = async () => {
    try {
      await MobileExamService.submitAttempt(testId);
    } catch (e) {
      console.warn("Submit fallback:", e);
    }
    onFinish(testId);
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "40px" }}>
      {/* Top Timer Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 16px", borderRadius: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "13px" }}>Question {currentIdx + 1}/{sampleQuestions.length}</div>
        <div style={{ fontWeight: 800, fontSize: "14px", color: "#60a5fa" }}>⏱ {formatTimer(secondsRemaining)}</div>
      </div>

      {/* Question Card */}
      <Card style={{ minHeight: "260px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <Badge label={`+${currentQ.marks} Marks`} variant="success" />
          <Badge label={currentQ.type} variant="gray" />
        </div>

        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", lineHeight: "1.5", marginBottom: "16px" }}>
          {currentQ.questionText}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = (answers[currentQ.id] || []).includes(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                  fontSize: "13px",
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer"
                }}
              >
                {String.fromCharCode(65 + idx)}. {opt.text}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          title="Previous"
          variant="outline"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(currentIdx - 1)}
        />
        {currentIdx < sampleQuestions.length - 1 ? (
          <Button title="Next" onClick={() => setCurrentIdx(currentIdx + 1)} />
        ) : (
          <Button title="Submit Exam" variant="success" onClick={handleSubmit} />
        )}
      </div>
    </div>
  );
};

export const ResultScreen: React.FC<{ testId?: string; onBack?: () => void }> = ({ onBack }) => {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "80px" }}>
      <Header title="Exam Scorecard" subtitle="Results & Performance Analysis" onBack={onBack} />

      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          borderRadius: "16px",
          padding: "20px",
          color: "#ffffff",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#bfdbfe" }}>
          JEE Main All-India Grand Mock Test 1
        </div>
        <div style={{ fontSize: "36px", fontWeight: 800, margin: "8px 0" }}>
          248 <span style={{ fontSize: "16px", color: "#93c5fd" }}>/ 300</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px" }}>
          <span>🏆 Rank: <strong>#1 in Batch</strong></span>
          <span>•</span>
          <span>📈 <strong>82.67%</strong> Score</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Card style={{ textAlign: "center", padding: "12px" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>CORRECT</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>64</div>
        </Card>
        <Card style={{ textAlign: "center", padding: "12px" }}>
          <div style={{ fontSize: "11px", color: "#64748b" }}>INCORRECT</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ef4444" }}>4</div>
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>💡 Key Recommendation</div>
        <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5", margin: 0 }}>
          Excellent accuracy in Mechanics and Calculus! Focus on Organic reaction mechanisms for the next mock exam.
        </p>
      </Card>
    </div>
  );
};
