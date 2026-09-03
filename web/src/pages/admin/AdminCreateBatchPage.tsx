import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminApiService,
  AdminCourse,
  AdminTeacher,
  AdminRoom,
  AdminCourseSubject
} from "@/src/services/adminApi";
import {
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  BookOpen,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  X
} from "lucide-react";

interface ScheduleSlotDraft {
  subjectId: string;
  teacherId: string;
  roomId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
}

export const AdminCreateBatchPage: React.FC = () => {
  const navigate = useNavigate();

  // Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Master data
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [courseSubjects, setCourseSubjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Step 1: Batch Info ---
  const [batchInfo, setBatchInfo] = useState({
    courseId: "",
    name: "",
    code: "",
    academicSession: "2026-2027",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    maxStrength: 30,
    status: "ACTIVE"
  });

  // --- Step 2: Selected Subjects ---
  // Map of subjectId -> { selected: boolean, startDate?: string, expectedEndDate?: string, notes?: string }
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, { selected: boolean; notes?: string }>>({});

  // --- Step 3: Teacher Assignment ---
  // Map of subjectId -> teacherId
  const [assignedTeachers, setAssignedTeachers] = useState<Record<string, string>>({});

  // --- Step 4: Schedules ---
  const [schedules, setSchedules] = useState<ScheduleSlotDraft[]>([]);
  const [newSlot, setNewSlot] = useState<ScheduleSlotDraft>({
    subjectId: "",
    teacherId: "",
    roomId: "",
    dayOfWeek: "MONDAY",
    startTime: "10:00",
    endTime: "11:30"
  });

  // Load master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoadingData(true);
      try {
        const [coursesRes, teachersRes, roomsRes] = await Promise.all([
          AdminApiService.getCourses(),
          AdminApiService.getTeachers(),
          AdminApiService.getRooms()
        ]);
        setCourses(coursesRes);
        setTeachers(teachersRes);
        setRooms(roomsRes);

        if (coursesRes.length > 0) {
          setBatchInfo((prev) => ({ ...prev, courseId: coursesRes[0].id }));
        }
      } catch (err: any) {
        setErrorMsg("Failed to load initial data. Please refresh.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchMasterData();
  }, []);

  // When Course changes, load its subjects
  useEffect(() => {
    if (!batchInfo.courseId) return;

    const fetchCourseSubjects = async () => {
      try {
        const course = courses.find((c) => c.id === batchInfo.courseId);
        let subs: any[] = [];

        if (course?.courseSubjects && course.courseSubjects.length > 0) {
          subs = course.courseSubjects.map((cs) => cs.subject);
        } else {
          // Fetch from API
          const fetched = await AdminApiService.getCourseSubjects(batchInfo.courseId);
          subs = fetched.map((cs) => cs.subject);
        }

        // If no course subjects linked yet, fallback to all subjects
        if (subs.length === 0) {
          const allSubs = await AdminApiService.getSubjects();
          subs = allSubs;
        }

        setCourseSubjects(subs);

        // Pre-select all subjects by default
        const initialSelected: Record<string, { selected: boolean; notes?: string }> = {};
        subs.forEach((s) => {
          initialSelected[s.id] = { selected: true };
        });
        setSelectedSubjects(initialSelected);

        // Auto-match qualified teacher if any
        const initialTeachers: Record<string, string> = {};
        subs.forEach((s) => {
          const qualified = teachers.find((t) =>
            t.subjects?.some((ts) => ts.subjectId === s.id || ts.subject?.id === s.id)
          );
          if (qualified) {
            initialTeachers[s.id] = qualified.id;
          } else if (teachers.length > 0) {
            initialTeachers[s.id] = teachers[0].id;
          }
        });
        setAssignedTeachers(initialTeachers);
      } catch (err) {
        console.error("Error loading course subjects", err);
      }
    };

    fetchCourseSubjects();
  }, [batchInfo.courseId, courses, teachers]);

  // Steps Navigation & Validation
  const handleNext = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!batchInfo.name.trim()) {
        setErrorMsg("Please enter a Batch Name.");
        return;
      }
      if (!batchInfo.code.trim()) {
        setErrorMsg("Please enter a Batch Code.");
        return;
      }
      if (!batchInfo.courseId) {
        setErrorMsg("Please select a Course.");
        return;
      }
    }

    if (currentStep === 2) {
      const selectedCount = Object.values(selectedSubjects).filter((s) => s.selected).length;
      if (selectedCount === 0) {
        setErrorMsg("Please select at least one subject for this batch.");
        return;
      }
    }

    if (currentStep === 3) {
      // Ensure each selected subject has an assigned teacher
      const selectedIds = Object.keys(selectedSubjects).filter((id) => selectedSubjects[id].selected);
      for (const id of selectedIds) {
        if (!assignedTeachers[id]) {
          const sub = courseSubjects.find((s) => s.id === id);
          setErrorMsg(`Please assign a teacher for subject '${sub?.name || id}'.`);
          return;
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step 4: Schedule slot handlers
  const handleAddScheduleSlot = () => {
    setErrorMsg(null);
    if (!newSlot.subjectId) {
      setErrorMsg("Please select a Subject for this class slot.");
      return;
    }
    if (!newSlot.teacherId) {
      setErrorMsg("Please select a Teacher for this class slot.");
      return;
    }
    if (!newSlot.startTime || !newSlot.endTime) {
      setErrorMsg("Please enter Start and End time.");
      return;
    }

    // Client-side quick validation: Check if slot clashes with already added draft slot
    const slotStartMin = parseMinutes(newSlot.startTime);
    const slotEndMin = parseMinutes(newSlot.endTime);

    if (slotStartMin >= slotEndMin) {
      setErrorMsg("Start time must be before End time.");
      return;
    }

    for (const existing of schedules) {
      if (existing.dayOfWeek === newSlot.dayOfWeek) {
        const eStart = parseMinutes(existing.startTime);
        const eEnd = parseMinutes(existing.endTime);

        const overlaps = slotStartMin < eEnd && slotEndMin > eStart;
        if (overlaps) {
          // Check Teacher clash
          if (existing.teacherId === newSlot.teacherId) {
            setErrorMsg("This teacher already has a class scheduled at this time in this batch.");
            return;
          }
          // Check Room clash
          if (newSlot.roomId && existing.roomId && existing.roomId === newSlot.roomId) {
            setErrorMsg("This room is already scheduled at this time in this batch.");
            return;
          }
          // Batch itself shouldn't have overlapping class
          setErrorMsg("This batch already has a class scheduled at this overlapping time.");
          return;
        }
      }
    }

    setSchedules([...schedules, { ...newSlot }]);

    // Reset default for next slot
    setNewSlot((prev) => ({
      ...prev,
      startTime: prev.endTime,
      endTime: formatMinutes(parseMinutes(prev.endTime) + 90)
    }));
  };

  const handleRemoveScheduleSlot = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // Step 5: Final Submission via Transaction
  const handleSubmitBatch = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const chosenSubjectIds = Object.keys(selectedSubjects).filter(
        (id) => selectedSubjects[id].selected
      );

      const payload = {
        courseId: batchInfo.courseId,
        name: batchInfo.name.trim(),
        code: batchInfo.code.trim().toUpperCase(),
        academicSession: batchInfo.academicSession,
        description: batchInfo.description,
        startDate: batchInfo.startDate,
        endDate: batchInfo.endDate || null,
        maxStrength: Number(batchInfo.maxStrength) || 30,
        status: batchInfo.status,
        subjects: chosenSubjectIds.map((subId) => ({
          subjectId: subId,
          assignedTeacherId: assignedTeachers[subId] || null,
          notes: selectedSubjects[subId].notes || null
        })),
        schedules: schedules.map((s) => ({
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          roomId: s.roomId || null,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      };

      const created = await AdminApiService.createBatchWizard(payload);
      navigate(`/admin/batches/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create batch. Please check conflicts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time calculation helpers
  function parseMinutes(time: string) {
    const [h, m] = time.split(":").map((v) => parseInt(v, 10) || 0);
    return h * 60 + m;
  }

  function formatMinutes(min: number) {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  const stepTitles = [
    { num: 1, title: "Batch Information", icon: Layers },
    { num: 2, title: "Curriculum Subjects", icon: BookOpen },
    { num: 3, title: "Faculty Assignment", icon: GraduationCap },
    { num: 4, title: "Initial Timetable", icon: Calendar },
    { num: 5, title: "Review & Deploy", icon: Sparkles }
  ];

  if (loadingData) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Initializing Batch Setup Wizard...</p>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === batchInfo.courseId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/batches")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Batches
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            New Academic Batch Wizard
          </h1>
          <p className="text-sm text-gray-500">
            Set up a complete academic cohort with curriculum subjects, teacher assignments, and schedule
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Step {currentStep} of 5
          </span>
        </div>
      </div>

      {/* Stepper Breadcrumb */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px]">
          {stepTitles.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div
                  className={`flex items-center gap-2.5 ${
                    isCurrent
                      ? "text-indigo-600 font-semibold"
                      : isDone
                      ? "text-emerald-600 font-medium"
                      : "text-gray-400 font-normal"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-xs whitespace-nowrap">{step.title}</span>
                </div>

                {idx < stepTitles.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                      currentStep > step.num ? "bg-emerald-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-rose-500 hover:text-rose-700" />
          </button>
        </div>
      )}

      {/* Step Content Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        {/* ========================================================
            STEP 1: BATCH DETAILS
        ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 1: Cohort Information</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define the primary curriculum course, cohort naming, and intake capacity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Academic Course *
                </label>
                <select
                  value={batchInfo.courseId}
                  onChange={(e) => setBatchInfo({ ...batchInfo, courseId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) — {c.durationMonths ? `${c.durationMonths} Months` : "Standard Duration"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Development - Batch A"
                  value={batchInfo.name}
                  onChange={(e) => setBatchInfo({ ...batchInfo, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Batch Code (Unique ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FSD-2026-A"
                  value={batchInfo.code}
                  onChange={(e) => setBatchInfo({ ...batchInfo, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm uppercase font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Academic Session
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={batchInfo.academicSession}
                  onChange={(e) => setBatchInfo({ ...batchInfo, academicSession: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Max Student Capacity *
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={batchInfo.maxStrength}
                  onChange={(e) =>
                    setBatchInfo({ ...batchInfo, maxStrength: parseInt(e.target.value, 10) || 30 })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={batchInfo.startDate}
                  onChange={(e) => setBatchInfo({ ...batchInfo, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={batchInfo.endDate}
                  onChange={(e) => setBatchInfo({ ...batchInfo, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Batch Description / Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on schedule, prerequisites, target placement goals..."
                  value={batchInfo.description}
                  onChange={(e) => setBatchInfo({ ...batchInfo, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: COURSE SUBJECTS SELECTION
        ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 2: Configure Batch Curriculum</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select which subjects from <strong>{selectedCourse?.name}</strong> are taught in this batch.
              </p>
            </div>

            <div className="space-y-3">
              {courseSubjects.map((sub, idx) => {
                const isChecked = !!selectedSubjects[sub.id]?.selected;

                return (
                  <div
                    key={sub.id}
                    onClick={() =>
                      setSelectedSubjects({
                        ...selectedSubjects,
                        [sub.id]: {
                          ...selectedSubjects[sub.id],
                          selected: !isChecked
                        }
                      })
                    }
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{sub.name}</span>
                          <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {sub.code}
                          </span>
                        </div>
                        {sub.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{sub.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-400">
                      Module #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: FACULTY ASSIGNMENT
        ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 3: Assign Faculty to Subjects</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Assign a dedicated teacher to each selected subject for this cohort.
              </p>
            </div>

            <div className="space-y-4">
              {courseSubjects
                .filter((sub) => selectedSubjects[sub.id]?.selected)
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{sub.name}</span>
                        <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {sub.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select an instructor qualified in this subject domain.
                      </p>
                    </div>

                    <div className="w-full md:w-80">
                      <select
                        value={assignedTeachers[sub.id] || ""}
                        onChange={(e) =>
                          setAssignedTeachers({ ...assignedTeachers, [sub.id]: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="">Select Instructor...</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.firstName} {t.lastName} ({t.employeeCode || "FAC"}) — {t.specialization || "Faculty"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: INITIAL TIMETABLE SCHEDULE
        ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 4: Initial Schedule Setup (Optional)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add recurring weekly class slots with room allocation. Conflict engine ensures zero double-booking.
              </p>
            </div>

            {/* Add Slot Form Box */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-4">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Add New Class Slot
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Subject *
                  </label>
                  <select
                    value={newSlot.subjectId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setNewSlot({
                        ...newSlot,
                        subjectId: sId,
                        teacherId: assignedTeachers[sId] || newSlot.teacherId
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject...</option>
                    {courseSubjects
                      .filter((s) => selectedSubjects[s.id]?.selected)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Teacher *
                  </label>
                  <select
                    value={newSlot.teacherId}
                    onChange={(e) => setNewSlot({ ...newSlot, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Classroom / Lab
                  </label>
                  <select
                    value={newSlot.roomId}
                    onChange={(e) => setNewSlot({ ...newSlot, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None / Online</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code}) — {r.capacity} seats
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddScheduleSlot}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Schedule Slot
                </button>
              </div>
            </div>

            {/* List of Configured Slots */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Scheduled Slots ({schedules.length})
              </h4>

              {schedules.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No class slots added yet. You can also configure them later in Batch Details.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedules.map((slot, i) => {
                    const sub = courseSubjects.find((s) => s.id === slot.subjectId);
                    const teach = teachers.find((t) => t.id === slot.teacherId);
                    const rm = rooms.find((r) => r.id === slot.roomId);

                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                              {slot.dayOfWeek}
                            </span>
                            <span className="text-xs font-semibold text-gray-800">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 font-medium">
                            {sub?.name} • <span className="text-gray-500">{teach?.firstName} {teach?.lastName}</span>
                          </div>
                          {rm && (
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Building className="w-3 h-3" /> {rm.name} ({rm.code})
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleSlot(i)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: REVIEW & SUBMIT
        ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Step 5: Review & Initialize Batch</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review all academic connections. Once confirmed, the system creates the cohort, subjects, teacher assignments, and timetable atomically.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Batch Info Card */}
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Cohort Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">Course:</span>
                    <p className="font-semibold text-gray-900">{selectedCourse?.name} ({selectedCourse?.code})</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Batch Name & Code:</span>
                    <p className="font-semibold text-gray-900">{batchInfo.name} • <span className="font-mono text-xs">{batchInfo.code}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Academic Session:</span>
                      <p className="font-medium text-gray-800">{batchInfo.academicSession || "2026-2027"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Capacity:</span>
                      <p className="font-medium text-gray-800">{batchInfo.maxStrength} Students</p>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">Timeline:</span>
                    <p className="font-medium text-gray-800">
                      {batchInfo.startDate} {batchInfo.endDate ? `to ${batchInfo.endDate}` : "(Open-ended)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject & Faculty Summary */}
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Configured Curriculum ({Object.values(selectedSubjects).filter((s) => s.selected).length} Subjects)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {courseSubjects
                    .filter((s) => selectedSubjects[s.id]?.selected)
                    .map((sub) => {
                      const teach = teachers.find((t) => t.id === assignedTeachers[sub.id]);
                      return (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-lg bg-white border border-gray-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{sub.name}</span>
                            <span className="font-mono text-gray-500 ml-1.5">({sub.code})</span>
                          </div>
                          <div className="text-gray-600 font-medium flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                            {teach ? `${teach.firstName} ${teach.lastName}` : "Unassigned"}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Timetable slots summary */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Weekly Timetable ({schedules.length} Class Slots)
              </h4>
              {schedules.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No class slots configured initially.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {schedules.map((slot, i) => {
                    const sub = courseSubjects.find((s) => s.id === slot.subjectId);
                    const rm = rooms.find((r) => r.id === slot.roomId);
                    return (
                      <div key={i} className="p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="font-bold text-indigo-700">{slot.dayOfWeek}</span>{" "}
                        <span className="text-gray-700">({slot.startTime} - {slot.endTime})</span>
                        <p className="text-gray-900 font-medium mt-0.5">{sub?.name}</p>
                        {rm && <p className="text-gray-400 text-[11px]">{rm.name}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitBatch}
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-100 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deploying Batch Transaction...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deploy Batch & Academics</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
