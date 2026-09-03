import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TeacherApiService, TeacherAcademicScope } from "@/src/services/teacherApi";
import {
  Layers,
  BookOpen,
  Calendar,
  Clock,
  Building,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  GraduationCap
} from "lucide-react";

export const TeacherDashboardPage: React.FC = () => {
  const [data, setData] = useState<TeacherAcademicScope | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchScope = async () => {
      setLoading(true);
      try {
        const res = await TeacherApiService.getMyAcademicScope();
        setData(res);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load teacher dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchScope();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading faculty workspace...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <p className="font-semibold">Unable to load faculty dashboard</p>
          <p className="text-xs text-rose-600 mt-0.5">{errorMsg || "Teacher profile not linked."}</p>
        </div>
      </div>
    );
  }

  const { teacher, assignedBatches, batchSubjects, timetables } = data;

  // Calculate metrics
  const completedSubjects = batchSubjects.filter((bs) => bs.status === "COMPLETED").length;
  const inProgressSubjects = batchSubjects.filter((bs) => bs.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              Employee ID: {teacher.employeeCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {teacher.name}!
          </h1>
          <p className="text-sm text-indigo-100 max-w-xl">
            {teacher.specialization || "Faculty Instructor"}
            {teacher.skills && ` • Skills: ${teacher.skills}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/teacher/batches"
            className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Manage My Batches
          </Link>
          <Link
            to="/teacher/timetable"
            className="px-4 py-2 bg-indigo-700/50 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all border border-indigo-500/40 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> My Schedule
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Assigned Batches</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{assignedBatches.length}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Taught Subjects</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{batchSubjects.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Weekly Classes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{timetables.length}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Completed Modules</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{completedSubjects}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Assigned Subjects & Syllabus Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assigned Subjects & Syllabus Progress</h2>
              <p className="text-xs text-gray-500">Track and update completion milestones for your batches</p>
            </div>
            <Link
              to="/teacher/batches"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Update Progress <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {batchSubjects.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No subjects assigned to you yet.</p>
              </div>
            ) : (
              batchSubjects.map((bs) => (
                <div
                  key={bs.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{bs.subject.name}</h3>
                        <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {bs.subject.code}
                        </span>
                      </div>
                      {bs.notes && <p className="text-xs text-gray-500 mt-1 italic">{bs.notes}</p>}
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        bs.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : bs.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bs.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                      <span>Curriculum Completion</span>
                      <span className="font-bold text-gray-900">{bs.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          bs.progress === 100
                            ? "bg-emerald-500"
                            : bs.progress > 50
                            ? "bg-indigo-600"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${bs.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Weekly Class Schedule */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Class Schedule</h2>
              <p className="text-xs text-gray-500">Your weekly teaching slots</p>
            </div>
            <Link
              to="/teacher/timetable"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {timetables.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No scheduled classes found.</p>
              </div>
            ) : (
              timetables.slice(0, 5).map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3.5"
                >
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {slot.dayOfWeek}
                      </span>
                      <span className="font-mono text-xs font-medium text-gray-700">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{slot.subject?.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>Batch: {slot.batch?.name || "Cohort"}</span>
                      {slot.room && (
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Building className="w-3 h-3 text-gray-400" />
                          {slot.room.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
