import React, { useState, useEffect } from "react";
import { TeacherApiService, TeacherAcademicScope } from "@/src/services/teacherApi";
import {
  Calendar,
  Clock,
  Building,
  Layers,
  BookOpen,
  Video,
  ChevronRight
} from "lucide-react";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export const TeacherTimetablePage: React.FC = () => {
  const [data, setData] = useState<TeacherAcademicScope | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const res = await TeacherApiService.getMyAcademicScope();
        setData(res);
      } catch (err) {
        console.error("Failed to load teacher schedule", err);
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading your weekly timetable...</p>
      </div>
    );
  }

  const timetables = data?.timetables || [];

  const filteredTimetables =
    selectedDay === "ALL"
      ? timetables
      : timetables.filter((t) => t.dayOfWeek === selectedDay);

  // Group by day
  const slotsByDay: Record<string, typeof timetables> = {};
  DAYS_OF_WEEK.forEach((day) => {
    slotsByDay[day] = timetables.filter((t) => t.dayOfWeek === day);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                My Teaching Timetable
              </h1>
              <p className="text-sm text-gray-500">
                Weekly master schedule across assigned batches and allocated classrooms
              </p>
            </div>
          </div>
        </div>

        {/* Day Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedDay === "ALL"
                ? "bg-white text-indigo-700 shadow-xs font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Days
          </button>
          {DAYS_OF_WEEK.slice(0, 6).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDay === day
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable View */}
      {selectedDay === "ALL" ? (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day) => {
            const slots = slotsByDay[day];
            if (slots.length === 0) return null;

            return (
              <div key={day} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {day} ({slots.length} Classes)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <h4 className="font-bold text-gray-900 text-base mt-2">
                            {slot.subject?.name}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium">
                            Batch: <span className="text-gray-800">{slot.batch?.name}</span> (
                            <span className="font-mono">{slot.batch?.code}</span>)
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-gray-800">
                            {slot.room ? `${slot.room.name} (${slot.room.code})` : "Online Session"}
                          </span>
                        </div>

                        {slot.meetingLink && (
                          <a
                            href={slot.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                          >
                            <Video className="w-3.5 h-3.5" /> Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            {selectedDay} Schedule ({filteredTimetables.length} Classes)
          </h3>

          {filteredTimetables.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No classes scheduled on {selectedDay}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTimetables.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <h4 className="font-bold text-gray-900 text-base mt-2">{slot.subject?.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">
                      Batch: <span className="text-gray-800">{slot.batch?.name}</span> (
                      <span className="font-mono">{slot.batch?.code}</span>)
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-gray-800">
                        {slot.room ? `${slot.room.name} (${slot.room.code})` : "Online Session"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
