import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExamApiService, StartAttemptResponse, ExamQuestion } from "@/src/services/examApi";
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, Send, RotateCcw } from "lucide-react";

export const OnlineExamInterfacePage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<StartAttemptResponse | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionIds?: string[]; textAnswer?: string }>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180 * 60);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize test
  useEffect(() => {
    const init = async () => {
      if (!testId) return;
      try {
        const res = await ExamApiService.startAttempt(testId);
        setTestData(res);
        setSecondsRemaining(res.attempt.remainingSeconds || res.test.durationMinutes * 60);

        // Prepopulate saved answers
        const prefilled: Record<string, any> = {};
        for (const ans of res.attempt.savedAnswers || []) {
          prefilled[ans.questionId] = {
            selectedOptionIds: ans.selectedOptionIds || [],
            textAnswer: ans.textAnswer || ""
          };
        }
        setAnswers(prefilled);
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to load examination attempt from database.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [testId]);

  // Countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const questions = testData?.test?.questions || [];
  const currentQ = questions[currentIdx];

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleOptionSelect = async (optId: string) => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    let newSelected: string[] = [];

    if (currentQ.question.type === "SINGLE_CHOICE" || currentQ.question.type === "TRUE_FALSE") {
      newSelected = [optId];
    } else if (currentQ.question.type === "MULTIPLE_CHOICE") {
      const current = answers[qId]?.selectedOptionIds || [];
      if (current.includes(optId)) {
        newSelected = current.filter((id) => id !== optId);
      } else {
        newSelected = [...current, optId];
      }
    }

    const updated = {
      ...answers,
      [qId]: { ...answers[qId], selectedOptionIds: newSelected }
    };
    setAnswers(updated);

    // Auto-save to backend
    if (testId) {
      try {
        await ExamApiService.saveAnswer(testId, {
          questionId: qId,
          selectedOptionIds: newSelected
        });
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }
  };

  const handleTextAnswerChange = async (val: string) => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const updated = {
      ...answers,
      [qId]: { ...answers[qId], textAnswer: val }
    };
    setAnswers(updated);
  };

  const handleSaveTextAnswer = async () => {
    if (!currentQ || !testId) return;
    const qId = currentQ.question.id;
    const val = answers[qId]?.textAnswer || "";
    try {
      await ExamApiService.saveAnswer(testId, {
        questionId: qId,
        textAnswer: val
      });
    } catch (e) {
      console.error("Auto-save text answer failed:", e);
    }
  };

  const handleClearAnswer = async () => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const updated = { ...answers };
    delete updated[qId];
    setAnswers(updated);

    if (testId) {
      try {
        await ExamApiService.saveAnswer(testId, {
          questionId: qId,
          selectedOptionIds: [],
          textAnswer: ""
        });
      } catch (e) {
        console.error("Clear answer failed:", e);
      }
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      if (testId) {
        await ExamApiService.submitAttempt(testId);
      }
      navigate(`/student/results/${testId || "test-jee-01"}`, { replace: true });
    } catch (err) {
      console.error("Submit error:", err);
      navigate(`/student/results/${testId || "test-jee-01"}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const isAnswered = (qId: string) => {
    const ans = answers[qId];
    if (!ans) return false;
    if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return true;
    if (ans.textAnswer && ans.textAnswer.trim().length > 0) return true;
    return false;
  };

  const totalAnswered = questions.filter((q) => isAnswered(q.question.id)).length;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
          Loading examination assessment from database...
        </div>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div className="card" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px" }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Unable to Load Examination</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {errorMsg || "No questions found for this examination in the database."}
          </p>
          <button onClick={() => navigate("/student/tests")} className="btn btn-primary" style={{ width: "100%" }}>
            Return to Available Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
      {/* Exam Header */}
      <header
        style={{
          height: "64px",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 30
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
            {testData?.test?.title || "Online Examination"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            {currentQ?.sectionName || "Section: General"} • Question {currentIdx + 1} of {questions.length}
          </div>
        </div>

        {/* Live Timer Gauge */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: secondsRemaining < 300 ? "#7f1d1d" : "#1e293b",
              color: secondsRemaining < 300 ? "#fca5a5" : "#60a5fa",
              padding: "0.4rem 1rem",
              borderRadius: "999px",
              fontWeight: 800,
              fontSize: "1.1rem",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Clock size={18} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-primary"
            style={{ background: "#10b981", padding: "0.45rem 1rem", fontSize: "0.85rem" }}
          >
            <Send size={15} /> Submit Test
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", padding: "1.5rem", maxWidth: "1600px", width: "100%", margin: "0 auto" }}>
        {/* Left Column: Question Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              {/* Question Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-primary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                    Q{currentIdx + 1}
                  </span>
                  <span className="badge badge-gray">{currentQ?.question.type.replace("_", " ")}</span>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Marks: <strong style={{ color: "#10b981" }}>+{currentQ?.marks}</strong> | Penalty: <strong style={{ color: "#ef4444" }}>-{currentQ?.negativeMarks}</strong>
                </div>
              </div>

              {/* Question Text */}
              <div style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: "1.6", color: "var(--color-text-main)", marginBottom: "1.5rem" }}>
                {currentQ?.question.questionText}
              </div>

              {/* Choices / Input */}
              {currentQ?.question.type === "NUMERICAL" ? (
                <div style={{ maxWidth: "340px", marginTop: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                    Enter Numerical Value:
                  </label>
                  <input
                    type="text"
                    value={answers[currentQ.question.id]?.textAnswer || ""}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    onBlur={handleSaveTextAnswer}
                    placeholder="e.g. 2.5 or 42"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "2px solid var(--color-primary)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {currentQ?.question.options.map((opt, idx) => {
                    const isSelected = (answers[currentQ.question.id]?.selectedOptionIds || []).includes(opt.id);
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem 1.25rem",
                          borderRadius: "var(--radius-md)",
                          border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                          background: isSelected ? "#eff6ff" : "var(--color-surface)",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: isSelected ? "var(--color-primary)" : "#f1f5f9",
                            color: isSelected ? "#ffffff" : "var(--color-text-main)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            flexShrink: 0
                          }}
                        >
                          {letter}
                        </div>
                        <div style={{ fontSize: "0.95rem", color: "var(--color-text-main)", flex: 1 }}>
                          {opt.optionText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={handleClearAnswer}
                className="btn btn-outline"
                style={{ fontSize: "0.8rem", gap: "0.3rem" }}
              >
                <RotateCcw size={14} /> Clear Response
              </button>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="btn btn-outline"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <button
                  type="button"
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1.25rem" }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Question Palette</h3>

            <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.5rem", background: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#10b981" }} />
                <span>Answered ({totalAnswered})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#cbd5e1" }} />
                <span>Unanswered ({questions.length - totalAnswered})</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
              {questions.map((q, idx) => {
                const answered = isAnswered(q.question.id);
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "8px",
                      border: isCurrent ? "2px solid #0f172a" : "1px solid transparent",
                      background: answered ? "#10b981" : "#e2e8f0",
                      color: answered ? "#ffffff" : "#334155",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1.5rem"
          }}
        >
          <div className="card" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "2rem" }}>
            <AlertCircle size={48} color="var(--color-primary)" style={{ margin: "0 auto 1rem auto" }} />
            <h2 style={{ fontSize: "1.35rem", marginBottom: "0.5rem" }}>Submit Examination?</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: "1.5", marginBottom: "1.25rem" }}>
              You have answered <strong>{totalAnswered}</strong> out of <strong>{questions.length}</strong> questions.
              Once submitted, your responses will be evaluated instantly.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Continue Test
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="btn btn-primary"
                style={{ flex: 1, background: "#10b981" }}
              >
                {submitting ? "Evaluating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
