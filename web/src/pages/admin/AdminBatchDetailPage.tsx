import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AdminApiService,
  AdminBatch,
  AdminBatchSubject,
  AdminTeacher,
  AdminRoom,
  AdminStudent
} from "@/src/services/adminApi";
import {
  Layers,
  ChevronLeft,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  TrendingUp,
  UserPlus
} from "lucide-react";

export const AdminBatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<AdminBatch | null>(null);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AdminStudent[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tabs: "SUBJECTS" | "STUDENTS" | "TIMETABLE"
  const [activeTab, setActiveTab] = useState<"SUBJECTS" | "STUDENTS" | "TIMETABLE">("SUBJECTS");

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState<boolean>(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState<boolean>(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState<boolean>(false);

  const [selectedBatchSubject, setSelectedBatchSubject] = useState<AdminBatchSubject | null>(null);

  // Enrollment form
  const [enrollStudentId, setEnrollStudentId] = useState<string>("");
  const [enrollRollNumber, setEnrollRollNumber] = useState<string>("");

  // Add Subject form
  const [newSubjectForm, setNewSubjectForm] = useState({
    subjectId: "",
    assignedTeacherId: "",
    notes: ""
  });

  // Edit Batch Subject form (progress & teacher)
  const [editSubjectForm, setEditSubjectForm] = useState({
    assignedTeacherId: "",
    progress: 0,
    status: "NOT_STARTED",
    notes: ""
  });

  // Timetable Slot form
  const [newSlotForm, setNewSlotForm] = useState({
    subjectId: "",
    teacherId: "",
    roomId: "",
    dayOfWeek: "MONDAY",
    startTime: "10:00",
    endTime: "11:30"
  });

  const loadBatchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [batchRes, teachersRes, roomsRes, studentsRes, subjectsRes] = await Promise.all([
        AdminApiService.getBatchById(id),
        AdminApiService.getTeachers(),
        AdminApiService.getRooms(),
        AdminApiService.getStudents(),
        AdminApiService.getSubjects()
      ]);
      setBatch(batchRes);
      setTeachers(teachersRes);
      setRooms(roomsRes);
      setAvailableStudents(studentsRes);
      setAllSubjects(subjectsRes);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchDetails();
  }, [id]);

  // Handle Enrollment
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    setErrorMsg(null);

    const currentCount = batch.students?.length || 0;
    const max = batch.maxStrength || 30;

    // Enforce capacity error explicitly
    if (currentCount >= max) {
      setErrorMsg("Batch capacity has been reached.");
      return;
    }

    if (!enrollStudentId) {
      setErrorMsg("Please select a student to enroll.");
      return;
    }

    try {
      await AdminApiService.assignStudentToBatch(batch.id, enrollStudentId, enrollRollNumber || undefined);
      setSuccessMsg("Student enrolled successfully!");
      setIsEnrollModalOpen(false);
      setEnrollStudentId("");
      setEnrollRollNumber("");
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to enroll student.");
    }
  };

  // Handle Unenroll
  const handleUnenrollStudent = async (studentId: string, name: string) => {
    if (!batch) return;
    if (!window.confirm(`Unenroll student '${name}' from batch?`)) return;
    try {
      await AdminApiService.removeStudentFromBatch(batch.id, studentId);
      setSuccessMsg("Student unenrolled successfully.");
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to unenroll student.");
    }
  };

  // Handle Add Subject to Batch
  const handleAddSubjectToBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch || !newSubjectForm.subjectId) return;
    try {
      await AdminApiService.addSubjectToBatch(batch.id, newSubjectForm);
      setSuccessMsg("Subject configured for batch successfully!");
      setIsAddSubjectModalOpen(false);
      setNewSubjectForm({ subjectId: "", assignedTeacherId: "", notes: "" });
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add subject to batch.");
    }
  };

  // Handle Edit Batch Subject
  const handleOpenEditSubject = (bs: AdminBatchSubject) => {
    setSelectedBatchSubject(bs);
    setEditSubjectForm({
      assignedTeacherId: bs.assignedTeacherId || "",
      progress: bs.progress || 0,
      status: bs.status || "NOT_STARTED",
      notes: bs.notes || ""
    });
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateBatchSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchSubject) return;
    try {
      await AdminApiService.updateBatchSubject(selectedBatchSubject.id, editSubjectForm);
      setSuccessMsg("Batch subject updated successfully!");
      setIsEditSubjectModalOpen(false);
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update batch subject.");
    }
  };

  // Handle Add Timetable Slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    try {
      await AdminApiService.createTimetableSlot({
        batchId: batch.id,
        subjectId: newSlotForm.subjectId,
        teacherId: newSlotForm.teacherId,
        roomId: newSlotForm.roomId || null,
        dayOfWeek: newSlotForm.dayOfWeek,
        startTime: newSlotForm.startTime,
        endTime: newSlotForm.endTime
      });
      setSuccessMsg("Class slot scheduled successfully!");
      setIsAddSlotModalOpen(false);
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Schedule conflict detected.");
    }
  };

  // Handle Delete Timetable Slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm("Remove this class slot from schedule?")) return;
    try {
      await AdminApiService.deleteTimetableSlot(slotId);
      setSuccessMsg("Schedule slot removed.");
      loadBatchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove slot.");
    }
  };

  if (loading || !batch) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading batch academic hub...</p>
      </div>
    );
  }

  const enrolledCount = batch.students?.length || 0;
  const maxCapacity = batch.maxStrength || 30;
  const capacityPct = Math.min(100, Math.round((enrolledCount / maxCapacity) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* Back Link */}
      <button
        onClick={() => navigate("/admin/batches")}
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to All Batches
      </button>

      {/* Hero Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{batch.name}</h1>
                <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
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
              <p className="text-sm text-gray-500 mt-1">
                Course: <strong className="text-gray-800">{batch.course?.name}</strong> • Academic Session:{" "}
                <span className="text-indigo-600 font-medium">{batch.academicSession || "2026-2027"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" /> Enroll Student
            </button>
          </div>
        </div>

        {/* Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-1.5">
              <span>Capacity Utilization</span>
              <span>
                {enrolledCount} / {maxCapacity} Students
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPct >= 100 ? "bg-rose-500" : capacityPct > 75 ? "bg-amber-500" : "bg-indigo-600"
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Configured Subjects</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {batch.batchSubjects?.length || 0} Modules
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Weekly Class Slots</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {batch.timetables?.length || 0} Slots
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-500 hover:text-emerald-700" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-rose-500 hover:text-rose-700" />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-2xl">
        <button
          onClick={() => setActiveTab("SUBJECTS")}
          className={`py-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "SUBJECTS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects & Faculty</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {batch.batchSubjects?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`py-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "STUDENTS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Students</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {enrolledCount}/{maxCapacity}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("TIMETABLE")}
          className={`py-4 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "TIMETABLE"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {batch.timetables?.length || 0}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-b-2xl border border-gray-100 border-t-0 shadow-sm">
        {/* ========================================================
            TAB 1: SUBJECTS & FACULTY
        ======================================================== */}
        {activeTab === "SUBJECTS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Batch Curriculum & Faculty Mapping</h3>
                <p className="text-xs text-gray-500">Track subject completion progress and instructor assignments</p>
              </div>
              <button
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Subject to Batch
              </button>
            </div>

            {batch.batchSubjects?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No subjects mapped to this batch yet.</p>
                <button
                  onClick={() => setIsAddSubjectModalOpen(true)}
                  className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  Map Subject
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batch.batchSubjects?.map((bs) => (
                  <div
                    key={bs.id}
                    className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4 hover:border-gray-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base">{bs.subject.name}</h4>
                          <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {bs.subject.code}
                          </span>
                        </div>
                        {bs.notes && <p className="text-xs text-gray-500 mt-1 italic">{bs.notes}</p>}
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
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

                    {/* Assigned Teacher Card */}
                    <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Assigned Faculty</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {bs.assignedTeacher
                              ? `${bs.assignedTeacher.firstName} ${bs.assignedTeacher.lastName}`
                              : "No Teacher Assigned"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEditSubject(bs)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </div>

                    {/* Progress Slider Display */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Coursework Progress</span>
                        <span className="font-bold text-gray-800">{bs.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: ENROLLED STUDENTS
        ======================================================== */}
        {activeTab === "STUDENTS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Student Roster</h3>
                <p className="text-xs text-gray-500">
                  {enrolledCount} of {maxCapacity} seats filled
                </p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                disabled={enrolledCount >= maxCapacity}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" /> Enroll Student
              </button>
            </div>

            {enrolledCount === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No students enrolled in this batch yet.</p>
                <button
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  Enroll First Student
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Roll #</th>
                      <th className="px-5 py-3">Admission #</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Email & Contact</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batch.students?.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3 font-mono text-xs font-bold text-indigo-700">
                          {s.rollNumber || "N/A"}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">
                          {s.student.admissionNumber}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          {s.student.firstName} {s.student.lastName}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {s.student.email}
                          {s.student.phone && <span className="block text-gray-400">{s.student.phone}</span>}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {s.student.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() =>
                              handleUnenrollStudent(
                                s.studentId,
                                `${s.student.firstName} ${s.student.lastName}`
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Unenroll student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: TIMETABLE
        ======================================================== */}
        {activeTab === "TIMETABLE" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Weekly Class Schedule</h3>
                <p className="text-xs text-gray-500">Recurring timetable slots configured for this cohort</p>
              </div>
              <button
                onClick={() => setIsAddSlotModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Schedule Class
              </button>
            </div>

            {batch.timetables?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No classes scheduled for this batch yet.</p>
                <button
                  onClick={() => setIsAddSlotModalOpen(true)}
                  className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  Add Class Slot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {batch.timetables?.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {slot.dayOfWeek}
                        </span>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-bold text-gray-900 text-sm">{slot.subject?.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {slot.teacher?.firstName} {slot.teacher?.lastName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1 font-mono font-medium text-gray-800">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {slot.startTime} - {slot.endTime}
                      </div>

                      {slot.room && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{slot.room.code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Enroll Student */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Enroll Student into Batch</h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Student *
                </label>
                <select
                  required
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select an enrolled student...</option>
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Roll Number in Batch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FSD-002"
                  value={enrollRollNumber}
                  onChange={(e) => setEnrollRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex justify-between items-center">
                <span>Batch Capacity</span>
                <span className="font-bold text-gray-800">
                  {enrolledCount} / {maxCapacity} Seats
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Batch Subject (Teacher & Progress) */}
      {isEditSubjectModalOpen && selectedBatchSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                Manage {selectedBatchSubject.subject.name}
              </h3>
              <button
                onClick={() => setIsEditSubjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBatchSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assigned Teacher
                </label>
                <select
                  value={editSubjectForm.assignedTeacherId}
                  onChange={(e) =>
                    setEditSubjectForm({ ...editSubjectForm, assignedTeacherId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">No Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.specialization || "Faculty"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Syllabus Status
                </label>
                <select
                  value={editSubjectForm.status}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Progress Percentage
                  </label>
                  <span className="text-xs font-bold text-indigo-600">{editSubjectForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editSubjectForm.progress}
                  onChange={(e) =>
                    setEditSubjectForm({
                      ...editSubjectForm,
                      progress: parseInt(e.target.value, 10) || 0
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notes / Syllabus Milestones
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completed module 3. Moving to final assessment..."
                  value={editSubjectForm.notes}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditSubjectModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject to Batch */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Add Subject to Batch</h3>
              <button
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubjectToBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Subject *
                </label>
                <select
                  required
                  value={newSubjectForm.subjectId}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subjectId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Choose a subject...</option>
                  {allSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assign Teacher (Optional)
                </label>
                <select
                  value={newSubjectForm.assignedTeacherId}
                  onChange={(e) =>
                    setNewSubjectForm({ ...newSubjectForm, assignedTeacherId: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">None (Assign later)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Timetable Slot */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Schedule Class Slot</h3>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <select
                  required
                  value={newSlotForm.subjectId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    const matchedBs = batch.batchSubjects?.find((b) => b.subjectId === sId);
                    setNewSlotForm({
                      ...newSlotForm,
                      subjectId: sId,
                      teacherId: matchedBs?.assignedTeacherId || newSlotForm.teacherId
                    });
                  }}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select subject...</option>
                  {batch.batchSubjects?.map((bs) => (
                    <option key={bs.subjectId} value={bs.subjectId}>
                      {bs.subject.name} ({bs.subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teacher *
                </label>
                <select
                  required
                  value={newSlotForm.teacherId}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select teacher...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Classroom / Lab
                </label>
                <select
                  value={newSlotForm.roomId}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, roomId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Online / Virtual</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) — {r.capacity} seats
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Day *
                  </label>
                  <select
                    value={newSlotForm.dayOfWeek}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, dayOfWeek: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MONDAY">Mon</option>
                    <option value="TUESDAY">Tue</option>
                    <option value="WEDNESDAY">Wed</option>
                    <option value="THURSDAY">Thu</option>
                    <option value="FRIDAY">Fri</option>
                    <option value="SATURDAY">Sat</option>
                    <option value="SUNDAY">Sun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Start *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    End *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
