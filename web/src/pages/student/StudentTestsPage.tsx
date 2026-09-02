import React, {
  useState,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ExamApiService,
  AvailableTestItem,
} from "../../services/examApi";

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

  const sampleTests: AvailableTestItem[] =
    tests.length > 0
      ? tests
      : [
          {
            id: "test-jee-01",
            title:
              "JEE Main All-India Grand Mock Test 1",
            description:
              "Full syllabus Physics, Chemistry & Mathematics benchmark test modeled after NTA computer-based examination pattern.",
            durationMinutes: 180,
            totalMarks: 300,
            passingMarks: 100,
            startTime:
              "2026-09-01T00:00:00.000Z",
            endTime:
              "2026-09-30T23:59:59.000Z",
            isPublished: true,
            status: "LIVE",
            batch: {
              id: "b1",
              name: "JEE Morning Star Batch",
              code: "BATCH-JEE-M1",
            },
            myAttempt: null,
          },
          {
            id: "test-phy-02",
            title:
              "Physics Mechanics & Kinematics Sectional Assessment",
            description:
              "Covers Newton's Laws of Motion, Friction, Work Power Energy, and Circular Motion.",
            durationMinutes: 60,
            totalMarks: 100,
            passingMarks: 35,
            startTime:
              "2026-09-01T00:00:00.000Z",
            endTime:
              "2026-09-30T23:59:59.000Z",
            isPublished: true,
            status: "LIVE",
            subject: {
              id: "s1",
              name: "Physics",
              code: "PHY-JEE",
            },
            myAttempt: null,
          },
        ];

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
        {sampleTests.map((test) => {
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
        })}
      </div>
    </div>
  );
};