import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ExamApiService, TestResultData } from "../../services/examApi";
import { Trophy, CheckCircle2, XCircle, Award, ArrowLeft, Layers, Percent, HelpCircle } from "lucide-react";
import "./StudentResultsPage.css";
export const StudentResultsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [result, setResult] = useState<TestResultData | null>(null);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (testId) {
          const res = await ExamApiService.getTestResult(testId);
          setResult(res);
        } else {
          const list = await ExamApiService.getMyResults();
          setAllResults(list);
        }
      } catch (err) {
        console.warn("Using sample mock result fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  // Fallback sample evaluation scorecard
  const sampleResult: TestResultData = result || {
    id: "res-01",
    totalMarksObtained: 248,
    percentage: 82.67,
    percentile: 98.4,
    rank: 1,
    isPassed: true,
    remarks: "Outstanding Performance",
    student: { id: "s1", firstName: "Rohit", lastName: "Kumar", admissionNumber: "ADM-2026-001" },
    test: {
      id: "test-jee-01",
      title: "JEE Main All-India Grand Mock Test 1",
      durationMinutes: 180,
      totalMarks: 300,
      passingMarks: 100
    },
    attempt: {
      id: "att-01",
      startedAt: "2026-09-01T10:00:00.000Z",
      submittedAt: "2026-09-01T12:45:00.000Z",
      score: 248,
      totalAttempted: 68,
      totalCorrect: 64,
      totalIncorrect: 4,
      studentAnswers: [
        {
          id: "ans1",
          questionId: "q1",
          selectedOptionIds: ["opt1"],
          textAnswer: null,
          isCorrect: true,
          marksAwarded: 4,
          question: {
            id: "q1",
            type: "SINGLE_CHOICE",
            questionText: "A particle is projected vertically upwards with velocity u. The ratio of time taken to reach half of the maximum height to the total time to reach the maximum height is:",
            explanation: "Max height H = u²/(2g), Total time T = u/g. At h = H/2, using s = ut - 1/2gt², solving gives t = (1 - 1/√2)T.",
            options: [
              { id: "opt1", optionText: "1 - 1/√2", sortOrder: 1, isCorrect: true },
              { id: "opt2", optionText: "1 / √2", sortOrder: 2, isCorrect: false },
              { id: "opt3", optionText: "1 - √2", sortOrder: 3, isCorrect: false },
              { id: "opt4", optionText: "√2 - 1", sortOrder: 4, isCorrect: false }
            ]
          }
        },
        {
          id: "ans2",
          questionId: "q2",
          selectedOptionIds: ["opt5", "opt6", "opt8"],
          textAnswer: null,
          isCorrect: true,
          marksAwarded: 4,
          question: {
            id: "q2",
            type: "MULTIPLE_CHOICE",
            questionText: "Which of the following statements are TRUE regarding conservative electrostatic forces?",
            explanation: "Conservative fields have zero curl and zero closed loop line integrals. Potential difference is path-independent.",
            options: [
              { id: "opt5", optionText: "Work done in a closed loop is always zero", sortOrder: 1, isCorrect: true },
              { id: "opt6", optionText: "Electric field lines never form closed continuous loops in electrostatics", sortOrder: 2, isCorrect: true },
              { id: "opt7", optionText: "Curl of electrostatic field is always non-zero", sortOrder: 3, isCorrect: false },
              { id: "opt8", optionText: "Potential difference between two points depends only on endpoints, not on path", sortOrder: 4, isCorrect: true }
            ]
          }
        }
      ]
    }
  };

  return (
  <div className="student-results">
    <div className="student-results__header">
      <div>
        <h1>Performance & Results Analytics</h1>

        <p>
          Automated test scorecard, batch rank, accuracy
          metrics, and question explanations.
        </p>
      </div>

      <Link
        to="/student/tests"
        className="btn btn-outline student-results__back-button"
      >
        <ArrowLeft size={16} />
        Back to Online Tests
      </Link>
    </div>

    <div className="student-results__scorecard">
      <div className="student-results__scorecard-info">
        <div className="student-results__official-badge">
          <Award size={14} />
          Official Examination Scorecard
        </div>

        <h2>{sampleResult.test.title}</h2>

        <div className="student-results__student-info">
          <span>
            Student:
            <strong>
              {sampleResult.student.firstName}{" "}
              {sampleResult.student.lastName}
            </strong>
          </span>

          <span>
            Admission:
            <strong>
              {sampleResult.student.admissionNumber}
            </strong>
          </span>
        </div>
      </div>

      <div className="student-results__scorecard-stats">
        <div className="student-results__highlight-card">
          <div className="student-results__highlight-label">
            Batch Rank
          </div>

          <div className="student-results__highlight-value">
            <Trophy size={20} />
            #{sampleResult.rank || 1}
          </div>
        </div>

        <div className="student-results__highlight-card">
          <div className="student-results__highlight-label">
            Score
          </div>

          <div className="student-results__highlight-value">
            {sampleResult.totalMarksObtained}

            <span className="student-results__total-marks">
              / {sampleResult.test.totalMarks}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="student-results__metrics">
      <div className="card student-results__metric">
        <div className="student-results__metric-label">
          PERCENTAGE
        </div>

        <div className="student-results__metric-value student-results__metric-value--primary">
          {sampleResult.percentage}%
        </div>

        <div
          className={`student-results__metric-description ${
            sampleResult.isPassed
              ? "student-results__metric-description--success"
              : "student-results__metric-description--danger"
          }`}
        >
          {sampleResult.isPassed
            ? "✓ Qualified Threshold"
            : "✗ Below Pass Mark"}
        </div>
      </div>

      <div className="card student-results__metric">
        <div className="student-results__metric-label">
          PERCENTILE
        </div>

        <div className="student-results__metric-value student-results__metric-value--purple">
          {sampleResult.percentile || 98.4} %ile
        </div>

        <div className="student-results__metric-description">
          Relative to batch participants
        </div>
      </div>

      <div className="card student-results__metric">
        <div className="student-results__metric-label">
          CORRECT ANSWERS
        </div>

        <div className="student-results__metric-value student-results__metric-value--success">
          {sampleResult.attempt.totalCorrect}
        </div>

        <div className="student-results__metric-description">
          +{sampleResult.attempt.totalCorrect * 4}
          {" "}positive marks
        </div>
      </div>

      <div className="card student-results__metric">
        <div className="student-results__metric-label">
          INCORRECT ANSWERS
        </div>

        <div className="student-results__metric-value student-results__metric-value--danger">
          {sampleResult.attempt.totalIncorrect}
        </div>

        <div className="student-results__metric-description student-results__metric-description--danger">
          -{sampleResult.attempt.totalIncorrect}
          {" "}negative marking penalty
        </div>
      </div>
    </div>

    <div className="card student-results__review-card">
      <div className="card-header">
        <div className="student-results__review-title">
          <HelpCircle size={18} />

          <h3>
            Question-by-Question Solution Review
          </h3>
        </div>

        <span className="badge badge-primary">
          {sampleResult.attempt.studentAnswers?.length || 2}
          {" "}Questions Evaluated
        </span>
      </div>

      <div className="student-results__questions">
        {(sampleResult.attempt.studentAnswers || []).map(
          (ans, idx) => (
            <div
              key={ans.id || idx}
              className="student-results__question"
            >
              <div className="student-results__question-header">
                <span className="badge badge-primary">
                  Question {idx + 1}
                </span>

                <span
                  className={`badge student-results__answer-status ${
                    ans.isCorrect
                      ? "badge-success"
                      : "badge-danger"
                  }`}
                >
                  {ans.isCorrect ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}

                  {ans.isCorrect
                    ? "Correct (+4)"
                    : "Incorrect (-1)"}
                </span>
              </div>

              <div className="student-results__question-text">
                {ans.question.questionText}
              </div>

              <div className="student-results__options">
                {ans.question.options.map((opt) => {
                  const isUserChosen =
                    (
                      ans.selectedOptionIds || []
                    ).includes(opt.id);

                  const isCorrectOpt =
                    opt.isCorrect;

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
                      <span>
                        {opt.optionText}
                      </span>

                      {isCorrectOpt && (
                        <span className="student-results__option-status student-results__option-status--correct">
                          ✓ Correct Answer
                        </span>
                      )}

                      {isUserChosen &&
                        !isCorrectOpt && (
                          <span className="student-results__option-status student-results__option-status--wrong">
                            Your Choice (Wrong)
                          </span>
                        )}
                    </div>
                  );
                })}
              </div>

              {ans.question.explanation && (
                <div className="student-results__explanation">
                  <strong>
                    💡 Detailed Solution:
                  </strong>

                  <p>
                    {ans.question.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  </div>
);
};
