import React, {
  useState,
  useEffect,
} from "react";

import {
  StudentApiService,
  StudentScheduleResponse,
} from "@/src/services/studentApi";

import {
  Calendar,
  MapPin,
  Video,
  User,
  CheckCircle2,
} from "lucide-react";

import "./StudentTimetablePage.css";

export const StudentTimetablePage: React.FC = () => {
  const days = [
    {
      key: "MONDAY",
      label: "Monday",
    },
    {
      key: "TUESDAY",
      label: "Tuesday",
    },
    {
      key: "WEDNESDAY",
      label: "Wednesday",
    },
    {
      key: "THURSDAY",
      label: "Thursday",
    },
    {
      key: "FRIDAY",
      label: "Friday",
    },
    {
      key: "SATURDAY",
      label: "Saturday",
    },
    {
      key: "SUNDAY",
      label: "Sunday",
    },
  ];

  const currentDayIndex =
    new Date().getDay() === 0
      ? 6
      : new Date().getDay() - 1;

  const todayKey =
    days[currentDayIndex]?.key || "MONDAY";

  const [selectedDay, setSelectedDay] =
    useState<string>(todayKey);

  const [schedule, setSchedule] =
    useState<StudentScheduleResponse | null>(
      null
    );

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await StudentApiService.getMySchedule();

        setSchedule(data);
      } catch (err) {
        console.error(
          "Failed to load timetable:",
          err
        );
      }
    };

    load();
  }, []);

  const daySlots =
    schedule?.scheduleByDay?.[selectedDay] ||
    (selectedDay === "MONDAY" ||
    selectedDay === "WEDNESDAY" ||
    selectedDay === "FRIDAY"
      ? [
          {
            id: "1",
            startTime: "09:00",
            endTime: "10:30",
            classType: "OFFLINE",
            roomNumber: "LH-101",
            subject: {
              name:
                "Physics (Mechanics, Electrodynamics & Optics)",
              code: "PHY-JEE",
            },
            teacher: {
              firstName: "Dr. Harish",
              lastName: "Verma",
            },
            batch: {
              name:
                "JEE Morning Star Batch",
            },
          },
          {
            id: "2",
            startTime: "11:00",
            endTime: "12:30",
            classType: "ONLINE",
            meetingLink:
              "https://meet.google.com/abc-defg-hij",
            roomNumber: null,
            subject: {
              name:
                "Mathematics (Calculus & Algebra)",
              code: "MATH-JEE",
            },
            teacher: {
              firstName: "Prof. Sunita",
              lastName: "Ramanujan",
            },
            batch: {
              name:
                "JEE Morning Star Batch",
            },
          },
        ]
      : []);

  const selectedDayLabel =
    days.find(
      (day) => day.key === selectedDay
    )?.label;

  return (
    <div className="student-timetable">
      <div className="student-timetable__header">
        <h1>Weekly Class Timetable</h1>

        <p>
          Live schedule and classroom allocations
          for your enrolled batches.
        </p>
      </div>

      <div className="student-timetable__day-tabs">
        {days.map((day) => {
          const isSelected =
            selectedDay === day.key;

          const isToday =
            todayKey === day.key;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() =>
                setSelectedDay(day.key)
              }
              className={`student-timetable__day-button ${
                isSelected
                  ? "student-timetable__day-button--selected"
                  : ""
              } ${
                isToday
                  ? "student-timetable__day-button--today"
                  : ""
              }`}
            >
              <span>{day.label}</span>

              {isToday && (
                <span className="student-timetable__today-badge">
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="card student-timetable__schedule-card">
        <div className="card-header">
          <div className="student-timetable__schedule-title">
            <Calendar
              size={18}
              className="student-timetable__calendar-icon"
            />

            <h2>
              {selectedDayLabel} Classes
            </h2>
          </div>

          <span className="badge badge-primary">
            {daySlots.length} Classes Scheduled
          </span>
        </div>

        {daySlots.length === 0 ? (
          <div className="student-timetable__empty">
            <Calendar size={48} />

            <div>
              No classes scheduled on{" "}
              {selectedDayLabel}
            </div>

            <p>
              Use this day for self-study,
              assignments, and concept revision.
            </p>
          </div>
        ) : (
          <div className="student-timetable__slots">
            {daySlots.map(
              (slot: any, index: number) => (
                <div
                  key={slot.id || index}
                  className="student-timetable__slot"
                >
                  <div className="student-timetable__slot-main">
                    <div className="student-timetable__time-box">
                      <span>Time</span>

                      <strong>
                        {slot.startTime} –{" "}
                        {slot.endTime}
                      </strong>
                    </div>

                    <div className="student-timetable__class-info">
                      <h3>
                        {slot.subject.name}
                      </h3>

                      <div className="student-timetable__class-meta">
                        <div>
                          <User size={14} />
                          {slot.teacher.firstName}{" "}
                          {slot.teacher.lastName}
                        </div>

                        {slot.roomNumber && (
                          <div>
                            <MapPin size={14} />
                            Room:
                            <strong>
                              {slot.roomNumber}
                            </strong>
                          </div>
                        )}

                        <span
                          className={`badge ${
                            slot.classType ===
                            "ONLINE"
                              ? "badge-primary"
                              : "badge-gray"
                          }`}
                        >
                          {slot.classType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="student-timetable__slot-action">
                    {slot.meetingLink ? (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        <Video size={16} />
                        Join Online Lecture
                      </a>
                    ) : (
                      <div className="student-timetable__offline-status">
                        <CheckCircle2 size={16} />
                        In-Class Lecture
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};