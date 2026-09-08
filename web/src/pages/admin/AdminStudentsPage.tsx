import React, { useState, useEffect, useMemo } from "react";
import {
  AdminApiService,
  AdminStudent,
  AdminCourse,
  AdminBatch,
  AdminStudentBatchEnrollment
} from "@/src/services/adminApi";
import {
  Users,
  PlusCircle,
  X,
  Search,
  Check,
  AlertCircle,
  GraduationCap,
  Layers,
  BookOpen,
  Trash2,
  Filter,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
  RefreshCw,
  Key
} from "lucide-react";

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Student Registration Form State
  const [enrollInBatchNow, setEnrollInBatchNow] = useState<boolean>(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "StudentPassword123!",
    admissionNumber: "",
    phone: "",
    gender: "MALE",
  });

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  // Manage Enrollments Modal for Existing Student
  const [manageStudent, setManageStudent] = useState<AdminStudent | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [manageCourseId, setManageCourseId] = useState<string>("");
  const [manageBatchId, setManageBatchId] = useState<string>("");
  const [manageRollNumber, setManageRollNumber] = useState<string>("");
  const [isEnrollingBatch, setIsEnrollingBatch] = useState<boolean>(false);
  const [isUnenrollingBatchId, setIsUnenrollingBatchId] = useState<string | null>(null);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, coursesData, batchesData] = await Promise.all([
        AdminApiService.getStudents(),
        AdminApiService.getCourses(),
        AdminApiService.getBatches(),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load students and academic catalogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter batches for the Create Student modal based on chosen course
  const availableBatchesForCreate = useMemo(() => {
    if (!selectedCourseId) return batches;
    return batches.filter((b) => b.courseId === selectedCourseId);
  }, [batches, selectedCourseId]);

  // Filter batches for the Manage Enrollments modal based on chosen course
  const availableBatchesForManage = useMemo(() => {
    if (!manageStudent) return [];
    const alreadyEnrolledBatchIds = new Set(
      manageStudent.batches?.map((b) => b.batchId) || []
    );

    let list = batches.filter((b) => !alreadyEnrolledBatchIds.has(b.id));
    if (manageCourseId) {
      list = list.filter((b) => b.courseId === manageCourseId);
    }
    return list;
  }, [batches, manageStudent, manageCourseId]);

  // Handle New Student Enrollment Submission
  const handleEnrollNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        ...form,
        gender: form.gender || null,
        phone: form.phone || null,
      };

      if (enrollInBatchNow && selectedBatchId) {
        payload.batchId = selectedBatchId;
        if (rollNumber) {
          payload.rollNumber = rollNumber;
        }
      }

      await AdminApiService.createStudent(payload);
      setSuccessMsg("Student registered and enrolled successfully!");
      setIsModalOpen(false);

      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "StudentPassword123!",
        admissionNumber: "",
        phone: "",
        gender: "MALE",
      });
      setShowPassword(false);
      setSelectedCourseId("");
      setSelectedBatchId("");
      setRollNumber("");

      await loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to register student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open the Manage Enrollments modal for a student
  const openManageEnrollmentsModal = (student: AdminStudent) => {
    setManageStudent(student);
    setManageCourseId("");
    setManageBatchId("");
    setManageRollNumber(student.admissionNumber || "");
    setIsManageModalOpen(true);
  };

  // Assign Student to a Batch from Manage Modal
  const handleAssignBatchToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageStudent || !manageBatchId) return;

    setIsEnrollingBatch(true);
    setErrorMsg(null);
    try {
      await AdminApiService.assignStudentToBatch(
        manageBatchId,
        manageStudent.id,
        manageRollNumber || undefined
      );

      setSuccessMsg(`Student enrolled in batch successfully!`);
      setManageBatchId("");
      setManageCourseId("");

      // Refresh data and update current student state
      const updatedStudents = await AdminApiService.getStudents();
      setStudents(updatedStudents);

      const refreshedStudent = updatedStudents.find((s) => s.id === manageStudent.id);
      if (refreshedStudent) {
        setManageStudent(refreshedStudent);
      }

      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to enroll student into batch.");
    } finally {
      setIsEnrollingBatch(false);
    }
  };

  // Remove Student from a Batch
  const handleUnenrollFromBatch = async (batchId: string) => {
    if (!manageStudent) return;
    if (!window.confirm("Are you sure you want to unenroll this student from this batch?")) {
      return;
    }

    setIsUnenrollingBatchId(batchId);
    setErrorMsg(null);
    try {
      await AdminApiService.removeStudentFromBatch(batchId, manageStudent.id);
      setSuccessMsg("Student unenrolled from batch.");

      // Refresh data and update current student state
      const updatedStudents = await AdminApiService.getStudents();
      setStudents(updatedStudents);

      const refreshedStudent = updatedStudents.find((s) => s.id === manageStudent.id);
      if (refreshedStudent) {
        setManageStudent(refreshedStudent);
      }

      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to unenroll student from batch.");
    } finally {
      setIsUnenrollingBatchId(null);
    }
  };

  // Filtered Students List
  const filteredStudents = students.filter((stu) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      stu.firstName.toLowerCase().includes(term) ||
      stu.lastName.toLowerCase().includes(term) ||
      stu.admissionNumber.toLowerCase().includes(term) ||
      stu.email.toLowerCase().includes(term) ||
      (stu.phone && stu.phone.toLowerCase().includes(term)) ||
      (stu.batches &&
        stu.batches.some(
          (b) =>
            b.batch.name.toLowerCase().includes(term) ||
            b.batch.code.toLowerCase().includes(term) ||
            b.batch.course?.name.toLowerCase().includes(term) ||
            (b.rollNumber && b.rollNumber.toLowerCase().includes(term))
        ));

    if (!matchesSearch) return false;

    // Course filter
    if (courseFilter) {
      const hasCourse = stu.batches?.some(
        (b) => b.batch.courseId === courseFilter || b.batch.course?.id === courseFilter
      );
      if (!hasCourse) return false;
    }

    // Batch filter
    if (batchFilter) {
      const hasBatch = stu.batches?.some((b) => b.batchId === batchFilter);
      if (!hasBatch) return false;
    }

    // Status filter
    if (statusFilter && stu.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Alert Messages */}
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

      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            style={{ background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer" }}
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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>Student Management</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Enroll students into courses and batches, manage academic cohorts, and configure roll numbers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setSelectedCourseId("");
            setSelectedBatchId("");
          }}
          className="btn btn-primary"
          style={{ gap: "0.4rem" }}
        >
          <PlusCircle size={16} /> Enroll New Student
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#ffffff",
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Search input */}
        <div style={{ position: "relative", flex: 2, minWidth: "240px" }}>
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
            placeholder="Search by name, email, admission no, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem 0.6rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter by Course */}
        <div style={{ flex: 1, minWidth: "170px" }}>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setBatchFilter(""); // Reset batch filter when course changes
            }}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <option value="">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Batch */}
        <div style={{ flex: 1, minWidth: "170px" }}>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <option value="">All Batches ({batches.length})</option>
            {batches
              .filter((b) => !courseFilter || b.courseId === courseFilter)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div style={{ minWidth: "130px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="ALUMNI">ALUMNI</option>
          </select>
        </div>

        {/* Clear Filter Button */}
        {(searchTerm || courseFilter || batchFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setCourseFilter("");
              setBatchFilter("");
              setStatusFilter("");
            }}
            className="btn btn-outline"
            style={{ padding: "0.6rem 0.85rem", fontSize: "0.8rem", color: "#64748b" }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", padding: "0 0.25rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b" }}>
            Showing {filteredStudents.length} of {students.length} Students
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Student Name</th>
                <th>Enrolled Course & Batch</th>
                <th>Contact Phone & Email</th>
                <th>Status</th>
                <th>Enrolled Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => {
                  const hasBatches = stu.batches && stu.batches.length > 0;

                  return (
                    <tr key={stu.id}>
                      {/* Admission Number */}
                      <td style={{ fontWeight: 700, color: "var(--color-primary)", fontFamily: "monospace" }}>
                        {stu.admissionNumber}
                      </td>

                      {/* Name */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "#eff6ff",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {stu.firstName.charAt(0)}
                            {stu.lastName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>
                              {stu.firstName} {stu.lastName}
                            </div>
                            {stu.gender && (
                              <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "capitalize" }}>
                                {stu.gender.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Course & Batch */}
                      <td>
                        {hasBatches ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            {stu.batches!.map((enrollment) => (
                              <div
                                key={enrollment.id}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "6px",
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.75rem",
                                  maxWidth: "320px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={enrollment.batch.course?.name || "Course"}
                                >
                                  {enrollment.batch.course?.name || "Course"}
                                </span>
                                <span style={{ color: "#94a3b8" }}>•</span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "#334155",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {enrollment.batch.name}
                                </span>
                                {enrollment.rollNumber && (
                                  <span
                                    style={{
                                      fontSize: "0.68rem",
                                      background: "#e0f2fe",
                                      color: "#0369a1",
                                      padding: "0.1rem 0.35rem",
                                      borderRadius: "4px",
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Roll: {enrollment.rollNumber}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                background: "#fef2f2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "6px",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                              }}
                            >
                              Not Enrolled
                            </span>
                            <button
                              type="button"
                              onClick={() => openManageEnrollmentsModal(stu)}
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                border: "1px solid #bfdbfe",
                                borderRadius: "6px",
                                padding: "0.2rem 0.5rem",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              + Enroll
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", fontSize: "0.8rem" }}>
                          <span style={{ color: "#0f172a", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Mail size={12} color="#64748b" /> {stu.email}
                          </span>
                          {stu.phone && (
                            <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <Phone size={12} color="#64748b" /> {stu.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${stu.status === "ACTIVE" ? "badge-success" : "badge-secondary"}`}>
                          {stu.status}
                        </span>
                      </td>

                      {/* Enrolled Date */}
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {stu.createdAt ? new Date(stu.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => openManageEnrollmentsModal(stu)}
                          className="btn btn-outline"
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.35rem 0.65rem",
                            gap: "0.35rem",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          title="Manage course and batch enrollments"
                        >
                          <Layers size={13} color="#2563eb" />
                          <span>Manage Batches</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--color-text-muted)" }}>
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Enroll New Student */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
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
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Enroll New Student</h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Register a new student and assign them to a course and batch.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollNewStudent} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Personal Details */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                  1. Student Identity & Contact
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="e.g. John"
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="e.g. Doe"
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="student@apexacademy.edu"
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      Admission Number
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      value={form.admissionNumber}
                      onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", boxSizing: "border-box" }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {/* Account Password Field */}
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Key size={14} color="#2563eb" /> Initial Account Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <RefreshCw size={12} /> Auto-generate
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter student password (min 6 characters)"
                      minLength={6}
                      style={{
                        width: "100%",
                        padding: "0.55rem 2.25rem 0.55rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        boxSizing: "border-box"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem", marginBottom: 0 }}>
                    The student will use this password alongside their Email or Admission Number to log in.
                  </p>
                </div>
              </div>

              {/* Course & Batch Enrollment Section */}
              <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <GraduationCap size={16} color="#2563eb" /> 2. Course & Batch Enrollment
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={enrollInBatchNow}
                      onChange={(e) => setEnrollInBatchNow(e.target.checked)}
                    />
                    <span>Enroll Now</span>
                  </label>
                </div>

                {enrollInBatchNow && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* Select Course */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                        Select Course *
                      </label>
                      <select
                        required={enrollInBatchNow}
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          setSelectedBatchId("");
                        }}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", boxSizing: "border-box" }}
                      >
                        <option value="">-- Choose Course --</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Batch */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                        Select Cohort / Batch *
                      </label>
                      <select
                        required={enrollInBatchNow}
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        disabled={!selectedCourseId && availableBatchesForCreate.length === 0}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", boxSizing: "border-box" }}
                      >
                        <option value="">-- Choose Batch --</option>
                        {availableBatchesForCreate.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code}) • Max: {b.maxStrength || 60} students
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                        Assigned Roll Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave blank to use Admission Number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gap: "0.4rem" }}>
                  <UserCheck size={16} />
                  {isSubmitting ? "Registering..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Course & Batch Enrollments for Existing Student */}
      {isManageModalOpen && manageStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
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
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
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
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                    Manage Course & Batch Enrollments
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    {manageStudent.firstName} {manageStudent.lastName} ({manageStudent.admissionNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Section 1: Active Enrollments */}
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
                  Active Course & Batch Enrollments ({manageStudent.batches?.length || 0})
                </div>

                {manageStudent.batches && manageStudent.batches.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {manageStudent.batches.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "0.9rem" }}>
                              {enrollment.batch.course?.name || "Course"}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>•</span>
                            <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" }}>
                              {enrollment.batch.name} ({enrollment.batch.code})
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem", fontSize: "0.75rem", color: "#64748b" }}>
                            {enrollment.rollNumber && (
                              <span>
                                <strong>Roll No:</strong> {enrollment.rollNumber}
                              </span>
                            )}
                            <span>
                              <strong>Enrolled:</strong> {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnenrollFromBatch(enrollment.batchId)}
                          disabled={isUnenrollingBatchId === enrollment.batchId}
                          className="btn btn-outline"
                          style={{
                            color: "#dc2626",
                            borderColor: "#fecaca",
                            fontSize: "0.75rem",
                            padding: "0.35rem 0.65rem",
                            gap: "0.3rem",
                          }}
                          title="Unenroll from this batch"
                        >
                          <Trash2 size={13} />
                          <span>{isUnenrollingBatchId === enrollment.batchId ? "Removing..." : "Unenroll"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "1.25rem",
                      textAlign: "center",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      border: "1px dashed #cbd5e1",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                    }}
                  >
                    This student is not enrolled in any course or batch yet.
                  </div>
                )}
              </div>

              {/* Section 2: Enroll into a New Batch Form */}
              <div style={{ padding: "1.25rem", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <GraduationCap size={16} /> Enroll into New Course / Batch
                </div>

                <form onSubmit={handleAssignBatchToStudent} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.25rem" }}>
                      Select Course *
                    </label>
                    <select
                      required
                      value={manageCourseId}
                      onChange={(e) => {
                        setManageCourseId(e.target.value);
                        setManageBatchId("");
                      }}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", boxSizing: "border-box" }}
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.25rem" }}>
                      Select Batch / Cohort *
                    </label>
                    <select
                      required
                      value={manageBatchId}
                      onChange={(e) => setManageBatchId(e.target.value)}
                      disabled={availableBatchesForManage.length === 0}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff", boxSizing: "border-box" }}
                    >
                      <option value="">
                        {availableBatchesForManage.length === 0
                          ? "-- No Available Batches --"
                          : "-- Choose Batch --"}
                      </option>
                      {availableBatchesForManage.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code}) • Max: {b.maxStrength || 60} students
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.25rem" }}>
                      Assigned Roll Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ROLL-01"
                      value={manageRollNumber}
                      onChange={(e) => setManageRollNumber(e.target.value)}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button
                      type="submit"
                      disabled={isEnrollingBatch || !manageBatchId}
                      className="btn btn-primary"
                      style={{ gap: "0.4rem" }}
                    >
                      <PlusCircle size={15} />
                      {isEnrollingBatch ? "Enrolling..." : "Enroll into Batch"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Close Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                <button type="button" onClick={() => setIsManageModalOpen(false)} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
