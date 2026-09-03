import React, { useState, useEffect } from "react";
import {
  AdminApiService,
  AdminCourse,
  AdminSubject,
} from "@/src/services/adminApi";
import {
  BookOpen,
  PlusCircle,
  X,
  Clock,
  Check,
  Search,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Layers,
  GraduationCap,
  Sparkles,
  ChevronRight,
  FolderPlus,
} from "lucide-react";

export const AdminCoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"COURSES" | "SUBJECTS">("COURSES");
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<string>("ALL");
  const [subjectSearch, setSubjectSearch] = useState<string>("");
  const [subjectCourseFilter, setSubjectCourseFilter] = useState<string>("ALL");

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Course Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState<boolean>(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState<boolean>(false);
  const [isViewCourseOpen, setIsViewCourseOpen] = useState<boolean>(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);

  // Subject Modals
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState<boolean>(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState<boolean>(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<AdminSubject | null>(null);

  // Course Form State
  const initialCourseForm = {
    name: "",
    code: "",
    durationMonths: 24,
    description: "",
  };
  const [courseForm, setCourseForm] = useState(initialCourseForm);

  const [editCourseForm, setEditCourseForm] = useState({
    id: "",
    name: "",
    code: "",
    durationMonths: 24,
    description: "",
    status: "ACTIVE",
  });

  // Subject Form State
  const initialSubjectForm = {
    courseId: "",
    name: "",
    code: "",
    description: "",
  };
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);

  const [editSubjectForm, setEditSubjectForm] = useState({
    id: "",
    courseId: "",
    name: "",
    code: "",
    description: "",
    status: "ACTIVE",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, subjectsRes] = await Promise.allSettled([
        AdminApiService.getCourses(),
        AdminApiService.getSubjects(),
      ]);

      let loadedCourses: AdminCourse[] = [];
      if (coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value)) {
        loadedCourses = coursesRes.value;
        setCourses(coursesRes.value);
      } else {
        setCourses([]);
      }

      if (loadedCourses.length > 0 && !subjectForm.courseId) {
        setSubjectForm((prev) => ({ ...prev, courseId: loadedCourses[0].id }));
      }

      if (subjectsRes.status === "fulfilled" && Array.isArray(subjectsRes.value)) {
        setSubjects(subjectsRes.value);
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load curriculum from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- COURSE HANDLERS ---
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!courseForm.name.trim() || !courseForm.code.trim()) {
      setErrorMsg("Course name and course code are required.");
      return;
    }

    const payload = {
      name: courseForm.name.trim(),
      code: courseForm.code.trim().toUpperCase(),
      durationMonths: Number(courseForm.durationMonths) || 24,
      description: courseForm.description.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await AdminApiService.createCourse(payload);
      setSuccessMsg(`Academic program '${payload.name}' created successfully!`);
      setIsCreateCourseOpen(false);
      setCourseForm(initialCourseForm);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create course in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditCourseModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setEditCourseForm({
      id: course.id,
      name: course.name,
      code: course.code,
      durationMonths: course.durationMonths || 24,
      description: course.description || "",
      status: course.status || "ACTIVE",
    });
    setIsEditCourseOpen(true);
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourseForm.id) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      name: editCourseForm.name.trim(),
      code: editCourseForm.code.trim().toUpperCase(),
      durationMonths: Number(editCourseForm.durationMonths) || 24,
      description: editCourseForm.description.trim() || null,
      status: editCourseForm.status,
    };

    try {
      await AdminApiService.updateCourse(editCourseForm.id, payload);
      setSuccessMsg(`Course '${payload.name}' updated successfully.`);
      setIsEditCourseOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update course in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteCourseModal = (course: AdminCourse) => {
    setSelectedCourse(course);
    setIsDeleteCourseOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      await AdminApiService.deleteCourse(selectedCourse.id);
      setSuccessMsg(`Course '${selectedCourse.name}' removed.`);
      setIsDeleteCourseOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete course. It may have active batches or enrolled students.");
    } finally {
      setIsSubmitting(false);
      setSelectedCourse(null);
    }
  };

  const openViewCourseModal = async (course: AdminCourse) => {
    setSelectedCourse(course);
    setIsViewCourseOpen(true);
    try {
      const fullCourse = await AdminApiService.getCourseById(course.id);
      if (fullCourse) {
        setSelectedCourse(fullCourse);
      }
    } catch (e) {
      // Keep selectedCourse
    }
  };

  // --- SUBJECT HANDLERS ---
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetCourseId = subjectForm.courseId || courses[0]?.id;
    if (!targetCourseId) {
      setErrorMsg("Please create an academic program / course first.");
      return;
    }

    if (!subjectForm.name.trim() || !subjectForm.code.trim()) {
      setErrorMsg("Subject name and subject code are required.");
      return;
    }

    const payload = {
      courseId: targetCourseId,
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      description: subjectForm.description.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await AdminApiService.createSubject(payload);
      setSuccessMsg(`Subject '${payload.name}' added successfully!`);
      setIsCreateSubjectOpen(false);
      setSubjectForm(initialSubjectForm);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create subject in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditSubjectModal = (subject: AdminSubject) => {
    setSelectedSubject(subject);
    setEditSubjectForm({
      id: subject.id,
      courseId: subject.courseId || subject.course?.id || "",
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      status: subject.status || "ACTIVE",
    });
    setIsEditSubjectOpen(true);
  };

  const handleEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubjectForm.id) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      name: editSubjectForm.name.trim(),
      code: editSubjectForm.code.trim().toUpperCase(),
      description: editSubjectForm.description.trim() || null,
      status: editSubjectForm.status,
    };

    try {
      await AdminApiService.updateSubject(editSubjectForm.id, payload);
      setSuccessMsg(`Subject '${payload.name}' updated successfully.`);
      setIsEditSubjectOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update subject in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteSubjectModal = (subject: AdminSubject) => {
    setSelectedSubject(subject);
    setIsDeleteSubjectOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await AdminApiService.deleteSubject(selectedSubject.id);
      setSuccessMsg(`Subject '${selectedSubject.name}' removed.`);
      setIsDeleteSubjectOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete subject. It may be in use in active batches.");
    } finally {
      setIsSubmitting(false);
      setSelectedSubject(null);
    }
  };

  // Filtered lists
  const filteredCourses = courses.filter((c) => {
    const searchMatch =
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(courseSearch.toLowerCase()));
    const statusMatch =
      courseStatusFilter === "ALL" ||
      c.status.toUpperCase() === courseStatusFilter.toUpperCase();
    return searchMatch && statusMatch;
  });

  const filteredSubjects = subjects.filter((s) => {
    const searchMatch =
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(subjectSearch.toLowerCase()));
    const courseMatch =
      subjectCourseFilter === "ALL" ||
      s.courseId === subjectCourseFilter ||
      s.course?.id === subjectCourseFilter;
    return searchMatch && courseMatch;
  });

  const activeCoursesCount = courses.filter((c) => c.status === "ACTIVE").length;
  const activeSubjectsCount = subjects.filter((s) => s.status === "ACTIVE" || !s.status).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toast Notification Banner */}
      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#f0fdf4",
            color: "#15803d",
            border: "1px solid #bbf7d0",
            fontSize: "0.875rem",
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(21, 128, 61, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            style={{ background: "transparent", border: "none", color: "#15803d", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "#ecfdf5",
              color: "#047857",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            <BookOpen size={13} />
            <span>Academic Curriculum Registry</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            Courses & Subjects Management
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            Structure educational programs, course durations, discipline syllabi, and subject prerequisites.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setIsCreateCourseOpen(true);
            }}
            className="btn btn-primary"
            style={{ gap: "0.4rem", fontWeight: 700, fontSize: "0.875rem" }}
          >
            <PlusCircle size={16} /> Create Course
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setIsCreateSubjectOpen(true);
            }}
            className="btn btn-outline"
            style={{ gap: "0.4rem", fontWeight: 700, fontSize: "0.875rem", background: "#ffffff" }}
          >
            <FolderPlus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Total Courses
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{courses.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Active Programs
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{activeCoursesCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#ede9fe",
              color: "#6d28d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Subjects Catalog
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{subjects.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#fffbeb",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Active Subjects
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{activeSubjectsCount}</div>
          </div>
        </div>
      </div>

      {/* Main View Switcher Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          gap: "1.5rem",
          fontWeight: 700,
          fontSize: "0.95rem",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("COURSES")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "COURSES" ? "3px solid #059669" : "3px solid transparent",
            padding: "0.5rem 0.25rem 0.75rem 0.25rem",
            color: activeTab === "COURSES" ? "#047857" : "#64748b",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "-2px",
            transition: "all 0.15s ease",
          }}
        >
          <BookOpen size={18} />
          <span>Academic Courses ({courses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SUBJECTS")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "SUBJECTS" ? "3px solid #059669" : "3px solid transparent",
            padding: "0.5rem 0.25rem 0.75rem 0.25rem",
            color: activeTab === "SUBJECTS" ? "#047857" : "#64748b",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "-2px",
            transition: "all 0.15s ease",
          }}
        >
          <Layers size={18} />
          <span>Curriculum Subjects ({subjects.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. COURSES TAB CONTENT                                                    */}
      {/* ========================================================================= */}
      {activeTab === "COURSES" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Search & Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              background: "#ffffff",
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "420px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search courses by name, code, or description..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.85rem 0.55rem 2.25rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["ALL", "ACTIVE", "INACTIVE"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCourseStatusFilter(st)}
                  style={{
                    border: "none",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: courseStatusFilter === st ? "#ecfdf5" : "#f1f5f9",
                    color: courseStatusFilter === st ? "#047857" : "#64748b",
                  }}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid-cols-2">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((cou) => {
                const subCount =
                  cou._count?.subjects ??
                  subjects.filter((s) => s.courseId === cou.id || s.course?.id === cou.id).length;
                const batCount = cou._count?.batches ?? 1;

                return (
                  <div
                    key={cou.id}
                    className="card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: "1px solid #e2e8f0",
                      gap: "0.85rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                          {cou.code}
                        </span>
                        <span
                          className={`badge ${cou.status === "ACTIVE" ? "badge-success" : "badge-gray"}`}
                          style={{ fontSize: "0.72rem", fontWeight: 700 }}
                        >
                          {cou.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.18rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                        {cou.name}
                      </h3>

                      <p
                        style={{
                          fontSize: "0.835rem",
                          color: "var(--color-text-muted)",
                          lineHeight: "1.5",
                          margin: 0,
                          minHeight: "2.4rem",
                        }}
                      >
                        {cou.description || "Comprehensive academic program syllabus and testing scope."}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.78rem",
                          color: "var(--color-text-muted)",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} /> Duration: {cou.durationMonths} Months
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <BookOpen size={13} /> {subCount} Subjects
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Layers size={13} /> {batCount} Batches
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "0.6rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openViewCourseModal(cou)}
                          className="btn btn-outline"
                          style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem", gap: "0.25rem" }}
                        >
                          <Eye size={13} /> View Curriculum
                        </button>

                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button
                            type="button"
                            onClick={() => openEditCourseModal(cou)}
                            className="btn btn-outline"
                            style={{ padding: "0.3rem 0.5rem" }}
                            title="Edit Course"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteCourseModal(cou)}
                            className="btn btn-outline"
                            style={{ padding: "0.3rem 0.5rem", color: "#ef4444" }}
                            title="Delete Course"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px dashed #cbd5e1",
                  color: "#64748b",
                }}
              >
                <BookOpen size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
                <div style={{ fontWeight: 700 }}>No courses found.</div>
                <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Create a new academic program to get started.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBJECTS TAB CONTENT                                                   */}
      {/* ========================================================================= */}
      {activeTab === "SUBJECTS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Search & Course Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              background: "#ffffff",
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "380px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search subjects by name, code, or syllabus..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.85rem 0.55rem 2.25rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>Filter Program:</span>
              <select
                value={subjectCourseFilter}
                onChange={(e) => setSubjectCourseFilter(e.target.value)}
                style={{
                  padding: "0.45rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  background: "#ffffff",
                }}
              >
                <option value="ALL">All Academic Programs</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-container">
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "1.25rem" }}>Subject Name & Syllabus</th>
                    <th>Subject Code</th>
                    <th>Academic Program</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((sub) => {
                      const matchedCourse = courses.find(
                        (c) => c.id === sub.courseId || c.id === sub.course?.id
                      );
                      return (
                        <tr key={sub.id}>
                          <td style={{ paddingLeft: "1.25rem" }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                                {sub.name}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                                {sub.description || "Core discipline curriculum component"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                              {sub.code}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.825rem",
                                fontWeight: 600,
                                color: "#047857",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <BookOpen size={13} /> {sub.course?.name || matchedCourse?.name || "Curriculum"}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                              {sub.status || "ACTIVE"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              <button
                                type="button"
                                onClick={() => openEditSubjectModal(sub)}
                                className="btn btn-outline"
                                style={{ padding: "0.35rem 0.5rem" }}
                                title="Edit Subject"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteSubjectModal(sub)}
                                className="btn btn-outline"
                                style={{ padding: "0.35rem 0.5rem", color: "#ef4444" }}
                                title="Delete Subject"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}
                      >
                        <Layers size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
                        <div style={{ fontWeight: 700 }}>No subjects found.</div>
                        <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                          Add subjects to map academic modules under courses.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE COURSE                                                    */}
      {/* ========================================================================= */}
      {isCreateCourseOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <BookOpen size={20} color="#059669" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Create Academic Program</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCourseOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ padding: "1.5rem" }}>
              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 0.85rem",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    marginBottom: "1rem",
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Course / Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT-JEE 2-Year Advanced Program"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JEE-2027"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Duration (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="60"
                      value={courseForm.durationMonths}
                      onChange={(e) => setCourseForm({ ...courseForm, durationMonths: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Description & Syllabus Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide goals, eligible examination targets, prerequisites..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateCourseOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: "0.55rem 1.35rem" }}
                >
                  {isSubmitting ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT COURSE                                                      */}
      {/* ========================================================================= */}
      {isEditCourseOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Edit size={18} color="#059669" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Edit Academic Program</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCourseOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditCourse} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Course / Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCourseForm.name}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={editCourseForm.code}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, code: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Duration (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editCourseForm.durationMonths}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, durationMonths: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Program Status
                  </label>
                  <select
                    value={editCourseForm.status}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, status: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editCourseForm.description}
                    onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditCourseOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: "0.55rem 1.35rem" }}
                >
                  {isSubmitting ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW COURSE DETAILS DOSSIER                                      */}
      {/* ========================================================================= */}
      {isViewCourseOpen && selectedCourse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
                padding: "1.75rem 1.5rem",
                color: "#ffffff",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setIsViewCourseOpen(false)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "1rem",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "999px",
                  color: "#ffffff",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                {selectedCourse.code}
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.35rem 0" }}>
                {selectedCourse.name}
              </h3>
              <div style={{ fontSize: "0.82rem", color: "#a7f3d0" }}>
                {selectedCourse.durationMonths} Months Duration • {selectedCourse.status}
              </div>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Curriculum Scope
                </div>
                <p style={{ fontSize: "0.85rem", color: "#334155", margin: "0.35rem 0 0 0", lineHeight: "1.5" }}>
                  {selectedCourse.description || "No overview provided."}
                </p>
              </div>

              {/* Subjects in this course */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                    Subjects Under This Program ({selectedCourse.subjects?.length || subjects.filter((s) => s.courseId === selectedCourse.id || s.course?.id === selectedCourse.id).length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectForm({ ...initialSubjectForm, courseId: selectedCourse.id });
                      setIsViewCourseOpen(false);
                      setIsCreateSubjectOpen(true);
                    }}
                    style={{ background: "transparent", border: "none", color: "#047857", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "3px" }}
                  >
                    <PlusCircle size={13} /> Add Subject
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(selectedCourse.subjects || subjects.filter((s) => s.courseId === selectedCourse.id || s.course?.id === selectedCourse.id)).length > 0 ? (
                    (selectedCourse.subjects || subjects.filter((s) => s.courseId === selectedCourse.id || s.course?.id === selectedCourse.id)).map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{sub.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{sub.code}</div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                          {sub.status || "ACTIVE"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "1rem" }}>
                      No subjects configured for this course yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsViewCourseOpen(false);
                  openEditCourseModal(selectedCourse);
                }}
                className="btn btn-primary"
                style={{ fontSize: "0.825rem" }}
              >
                <Edit size={14} /> Edit Course
              </button>
              <button
                type="button"
                onClick={() => setIsViewCourseOpen(false)}
                className="btn btn-outline"
                style={{ fontSize: "0.825rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE COURSE CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {isDeleteCourseOpen && selectedCourse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Remove Course</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>Confirm deletion of academic program</p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to delete <strong>{selectedCourse.name}</strong> ({selectedCourse.code})? This will also remove associated subjects and syllabus references.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteCourseOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteCourse}
                className="btn btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                {isSubmitting ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD SUBJECT                                                      */}
      {/* ========================================================================= */}
      {isCreateSubjectOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <FolderPlus size={20} color="#059669" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Add Curriculum Subject</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateSubjectOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} style={{ padding: "1.5rem" }}>
              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 0.85rem",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    marginBottom: "1rem",
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Parent Academic Program / Course *
                  </label>
                  <select
                    required
                    value={subjectForm.courseId}
                    onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics Mechanics"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PHY-101"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Syllabus Scope & Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key chapters, examination coverage, prerequisites..."
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateSubjectOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: "0.55rem 1.35rem" }}
                >
                  {isSubmitting ? "Adding..." : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT SUBJECT                                                     */}
      {/* ========================================================================= */}
      {isEditSubjectOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Edit size={18} color="#059669" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Edit Subject</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSubjectOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubject} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSubjectForm.name}
                      onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSubjectForm.code}
                      onChange={(e) => setEditSubjectForm({ ...editSubjectForm, code: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Status
                  </label>
                  <select
                    value={editSubjectForm.status}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, status: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editSubjectForm.description}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, description: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditSubjectOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: "0.55rem 1.35rem" }}
                >
                  {isSubmitting ? "Updating..." : "Update Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DELETE SUBJECT CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {isDeleteSubjectOpen && selectedSubject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Remove Subject</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>Confirm removal from curriculum</p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to remove <strong>{selectedSubject.name}</strong> ({selectedSubject.code})?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteSubjectOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubject}
                className="btn btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                {isSubmitting ? "Deleting..." : "Delete Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

