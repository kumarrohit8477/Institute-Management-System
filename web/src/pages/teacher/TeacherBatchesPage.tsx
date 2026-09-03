import React, { useState, useEffect } from "react";
import { TeacherApiService, TeacherAcademicScope } from "@/src/services/teacherApi";
import { AdminBatchSubject } from "@/src/services/adminApi";
import {
  Layers,
  BookOpen,
  Check,
  AlertCircle,
  Save,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users
} from "lucide-react";

export const TeacherBatchesPage: React.FC = () => {
  const [data, setData] = useState<TeacherAcademicScope | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local state for editable batch subjects
  const [progressState, setProgressState] = useState<
    Record<string, { progress: number; status: string; notes: string }>
  >({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await TeacherApiService.getMyAcademicScope();
      setData(res);

      // Initialize edit states
      const stateMap: Record<string, { progress: number; status: string; notes: string }> = {};
      res.batchSubjects.forEach((bs) => {
        stateMap[bs.id] = {
          progress: bs.progress || 0,
          status: bs.status || "NOT_STARTED",
          notes: bs.notes || ""
        };
      });
      setProgressState(stateMap);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load assigned batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProgress = async (batchSubjectId: string) => {
    const edit = progressState[batchSubjectId];
    if (!edit) return;

    setSavingId(batchSubjectId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await TeacherApiService.updateSubjectProgress(batchSubjectId, {
        progress: edit.progress,
        status: edit.status,
        notes: edit.notes
      });
      setSuccessMsg("Subject syllabus progress and status updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update subject progress");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading your batch coursework...</p>
      </div>
    );
  }

  if (!data) return null;

  const { assignedBatches, batchSubjects } = data;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                My Batches & Subject Coursework
              </h1>
              <p className="text-sm text-gray-500">
                Track curriculum completion, record lesson milestones, and manage syllabus progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Batches Container */}
      {assignedBatches.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No active cohorts assigned</h3>
          <p className="text-sm text-gray-500 mt-1">
            You will see your assigned batches here once the institute admin allocates subjects to you.
          </p>
        </div>
      ) : (
        assignedBatches.map((batch) => {
          // Filter batch subjects taught by this teacher in this batch
          const subjectsInBatch = batchSubjects.filter((bs) => bs.batchId === batch.id);

          return (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Batch Banner */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50/40 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-gray-900">{batch.name}</h2>
                    <span className="font-mono text-xs font-semibold bg-white text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                      {batch.code}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        batch.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Course: <strong className="text-gray-800">{batch.course?.name}</strong> • Academic Session:{" "}
                    <span className="font-medium text-indigo-600">{batch.academicSession || "2026-2027"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{batch._count?.students || batch.students?.length || 0} Students</span>
                  </div>
                </div>
              </div>

              {/* Subjects List */}
              <div className="p-6 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  My Assigned Modules ({subjectsInBatch.length})
                </h3>

                {subjectsInBatch.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No direct subject assignments in this cohort.</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {subjectsInBatch.map((bs) => {
                      const edit = progressState[bs.id] || {
                        progress: bs.progress || 0,
                        status: bs.status || "NOT_STARTED",
                        notes: bs.notes || ""
                      };

                      return (
                        <div
                          key={bs.id}
                          className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-base">{bs.subject.name}</h4>
                                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                  {bs.subject.code}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">Assigned Subject ID: {bs.id.slice(0, 8)}...</p>
                            </div>

                            <select
                              value={edit.status}
                              onChange={(e) =>
                                setProgressState({
                                  ...progressState,
                                  [bs.id]: { ...edit, status: e.target.value }
                                })
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none ${
                                edit.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : edit.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              <option value="NOT_STARTED">NOT STARTED</option>
                              <option value="IN_PROGRESS">IN PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </select>
                          </div>

                          {/* Progress Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-gray-700">Course Syllabus Covered</span>
                              <span className="font-bold text-indigo-700 text-sm">{edit.progress}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={edit.progress}
                              onChange={(e) =>
                                setProgressState({
                                  ...progressState,
                                  [bs.id]: {
                                    ...edit,
                                    progress: parseInt(e.target.value, 10) || 0,
                                    status:
                                      parseInt(e.target.value, 10) === 100
                                        ? "COMPLETED"
                                        : parseInt(e.target.value, 10) > 0
                                        ? "IN_PROGRESS"
                                        : edit.status
                                  }
                                })
                              }
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>

                          {/* Milestones / Notes */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                              Lesson Log / Milestones
                            </label>
                            <textarea
                              rows={2}
                              placeholder="e.g. Covered Chapters 1-4. Scheduled lab test on Friday..."
                              value={edit.notes}
                              onChange={(e) =>
                                setProgressState({
                                  ...progressState,
                                  [bs.id]: { ...edit, notes: e.target.value }
                                })
                              }
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveProgress(bs.id)}
                              disabled={savingId === bs.id}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                            >
                              {savingId === bs.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Update Progress</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
