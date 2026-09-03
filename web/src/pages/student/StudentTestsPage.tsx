import React, {
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ExamApiService,
  AvailableTestItem,
} from "@/src/services/examApi";

import {
  FileCheck2,
  Clock,
  Award,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import "./StudentTestsPage.css";

export const StudentTestsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tests, setTests] =
    useState<AvailableTestItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await ExamApiService.getAvailableTests();

        setTests(data);
      } catch (err) {
        console.error(
          "Failed to load tests:",
          err
        );
      }
    };

    load();
  }, []);

  const handleAction = (
    test: AvailableTestItem
  ) => {
    if (
      test.myAttempt?.status === "EVALUATED" ||
      test.myAttempt?.status === "SUBMITTED"
    ) {
      navigate(`/student/results/${test.id}`);
    } else {
      navigate(
        `/student/tests/${test.id}/attempt`
      );
    }
  };

  return (
    <div className="student-tests">
      <div className="student-tests__header">
        <h1>Online Examinations & Quizzes</h1>

        <p>
          Participate in scheduled competitive mock
          tests, sectional assessments, and benchmark
          quizzes.
        </p>
      </div>

      <div className="student-tests__list">
        {tests.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <FileCheck2 size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Examinations Available</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              There are currently no active online examinations or assessments scheduled for your batch in the database.
            </p>
          </div>
        ) : (
          tests.map((test) => {
          const isCompleted =
            test.myAttempt?.status === "EVALUATED" ||
            test.myAttempt?.status === "SUBMITTED";

          const isInProgress =
            test.myAttempt?.status === "IN_PROGRESS";

          return (
            <div
              key={test.id}
              className="card student-tests__item"
            >
              <div className="student-tests__content">
                <div
                  className={`student-tests__icon-box ${
                    isCompleted
                      ? "student-tests__icon-box--completed"
                      : ""
                  }`}
                >
                  <FileCheck2 size={28} />
                </div>

                <div className="student-tests__details">
                  <div className="student-tests__badges">
                    <span className="badge badge-primary">
                      {test.subject?.code ||
                        test.batch?.code ||
                        "FULL MOCK"}
                    </span>

                    {isCompleted ? (
                      <span className="badge badge-success student-tests__status-badge">
                        <CheckCircle2 size={12} />
                        Completed • Score:{" "}
                        {test.myAttempt?.score}
                      </span>
                    ) : isInProgress ? (
                      <span className="badge badge-warning student-tests__status-badge">
                        <Clock size={12} />
                        In Progress
                      </span>
                    ) : (
                      <span className="badge badge-primary">
                        Active Exam
                      </span>
                    )}
                  </div>

                  <h2>{test.title}</h2>

                  {test.description && (
                    <p className="student-tests__description">
                      {test.description}
                    </p>
                  )}

                  <div className="student-tests__info">
                    <div>
                      <Clock size={15} />
                      <strong>Duration:</strong>
                      {test.durationMinutes} Minutes
                    </div>

                    <div>
                      <Award size={15} />
                      <strong>Total Marks:</strong>
                      {test.totalMarks}
                      (Pass: {test.passingMarks})
                    </div>

                    <div>
                      <Calendar size={15} />
                      <strong>Window:</strong>
                      {new Date(
                        test.startTime
                      ).toLocaleDateString()}
                      –
                      {new Date(
                        test.endTime
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAction(test)
                }
                className={`btn student-tests__action ${
                  isCompleted
                    ? "btn-outline"
                    : "btn-primary"
                }`}
              >
                {isCompleted ? (
                  <>
                    View Scorecard & Review
                    <ArrowRight size={16} />
                  </>
                ) : isInProgress ? (
                  <>
                    Resume Online Test
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Start Online Test
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          );
        }))}
      </div>
    </div>
  );
};