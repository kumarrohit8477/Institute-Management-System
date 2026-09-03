import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ExamApiService, TestResultData } from "@/src/services/examApi";
import { Trophy, CheckCircle2, XCircle, Award, ArrowLeft, Layers, Percent, HelpCircle, AlertCircle } from "lucide-react";
import "./StudentResultsPage.css";

export const StudentResultsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [result, setResult] = useState<TestResultData | null>(null);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (testId) {
          const res = await ExamApiService.getTestResult(testId);
          setResult(res);
        } else {
          const list = await ExamApiService.getMyResults();
          setAllResults(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load test results from database:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  if (loading) {
    return (
      <div className="student-results" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div className="card" style={{ color: "var(--color-text-muted)", padding: "3rem" }}>
          Loading examination results from database...
        </div>
      </div>
    );
  }

  // Single test result view
  if (testId) {
    if (!result) {
      return (
        <div className="student-results">
          <div className="student-results__header">
            <div>
              <h1>Performance & Results Analytics</h1>
              <p>Automated test scorecard, batch rank, accuracy metrics, and question explanations.</p>
            </div>
            <Link to="/student/tests" className="btn btn-outline student-results__back-button">
              <ArrowLeft size={16} /> Back to Online Tests
            </Link>
          </div>
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <Award size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Scorecard Found</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              No evaluated examination results were found in the database for this test.
            </p>
            <Link to="/student/tests" className="btn btn-primary">
              View Available Tests
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="student-results">
        <div className="student-results__header">
          <div>
            <h1>Performance & Results Analytics</h1>
            <p>Automated test scorecard, batch rank, accuracy metrics, and question explanations.</p>
          </div>
          <Link to="/student/tests" className="btn btn-outline student-results__back-button">
            <ArrowLeft size={16} /> Back to Online Tests
          </Link>
        </div>

        <div className="student-results__scorecard">
          <div className="student-results__scorecard-info">
            <div className="student-results__official-badge">
              <Award size={14} /> Official Examination Scorecard
            </div>
            <h2>{result.test?.title || "Examination Assessment"}</h2>
            <div className="student-results__student-info">
              <span>
                Student: <strong>{result.student?.firstName} {result.student?.lastName}</strong>
              </span>
              <span>
                Admission: <strong>{result.student?.admissionNumber || "N/A"}</strong>
              </span>
            </div>
          </div>

          <div className="student-results__scorecard-stats">
            <div className="student-results__highlight-card">
              <div className="student-results__highlight-label">Batch Rank</div>
              <div className="student-results__highlight-value">
                <Trophy size={20} /> #{result.rank || 1}
              </div>
            </div>

            <div className="student-results__highlight-card">
              <div className="student-results__highlight-label">Score</div>
              <div className="student-results__highlight-value">
                {result.totalMarksObtained}
                <span className="student-results__total-marks">
                  / {result.test?.totalMarks || 100}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="student-results__metrics">
          <div className="card student-results__metric">
            <div className="student-results__metric-label">PERCENTAGE</div>
            <div className="student-results__metric-value">{result.percentage?.toFixed(1)}%</div>
          </div>
          <div className="card student-results__metric">
            <div className="student-results__metric-label">PERCENTILE</div>
            <div className="student-results__metric-value">{result.percentile?.toFixed(1)} %ile</div>
          </div>
          <div className="card student-results__metric">
            <div className="student-results__metric-label">ATTEMPT STATUS</div>
            <div className="student-results__metric-value">
              {result.isPassed ? (
                <span style={{ color: "#16a34a" }}>PASSED</span>
              ) : (
                <span style={{ color: "#dc2626" }}>FAILED</span>
              )}
            </div>
          </div>
        </div>

        {/* Question Solutions */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div className="card-header" style={{ marginBottom: "1rem" }}>
            <h3>Question-by-Question Solution Review</h3>
            <span className="badge badge-primary">
              {result.attempt?.studentAnswers?.length || 0} Questions Evaluated
            </span>
          </div>

          <div className="student-results__questions">
            {(result.attempt?.studentAnswers || []).map((ans: any, idx: number) => (
              <div key={ans.id || idx} className="student-results__question">
                <div className="student-results__question-header">
                  <span className="badge badge-primary">Question {idx + 1}</span>
                  <span className={`badge ${ans.isCorrect ? "badge-success" : "badge-danger"}`}>
                    {ans.isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {ans.isCorrect ? `Correct (+${ans.marksAwarded || 4})` : "Incorrect"}
                  </span>
                </div>

                <div className="student-results__question-text">
                  {ans.question?.questionText}
                </div>

                <div className="student-results__options">
                  {(ans.question?.options || []).map((opt: any) => {
                    const isUserChosen = (ans.selectedOptionIds || []).includes(opt.id);
                    const isCorrectOpt = opt.isCorrect;
                    return (
                      <div
                        key={opt.id}
                        className={`student-results__option ${
                          isCorrectOpt
                            ? "student-results__option--correct"
                            : isUserChosen
                            ? "student-results__option--wrong"
                            : ""
                        }`}
                      >
                        <span>{opt.optionText}</span>
                        {isCorrectOpt && (
                          <span className="student-results__option-status student-results__option-status--correct">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserChosen && !isCorrectOpt && (
                          <span className="student-results__option-status student-results__option-status--wrong">
                            Your Choice (Wrong)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {ans.question?.explanation && (
                  <div className="student-results__explanation">
                    <strong>💡 Detailed Solution:</strong>
                    <p>{ans.question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // All results list view
  return (
    <div className="student-results">
      <div className="student-results__header">
        <div>
          <h1>Examination Scorecards</h1>
          <p>Review all your completed assessments, scores, and percentile rankings.</p>
        </div>
        <Link to="/student/tests" className="btn btn-outline student-results__back-button">
          <ArrowLeft size={16} /> Back to Online Tests
        </Link>
      </div>

      {allResults.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <AlertCircle size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Evaluated Tests</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            You have not completed any online examinations in the database yet.
          </p>
          <Link to="/student/tests" className="btn btn-primary">
            Take a Test
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {allResults.map((item: any) => (
            <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{item.test?.title}</h3>
                <div style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Submitted: {item.attempt?.submittedAt ? new Date(item.attempt.submittedAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary)" }}>
                    {item.totalMarksObtained} / {item.test?.totalMarks}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {item.percentage?.toFixed(1)}% ({item.percentile?.toFixed(1)} %ile)
                  </div>
                </div>
                <Link to={`/student/results/${item.testId || item.test?.id}`} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}>
                  View Full Scorecard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
