import React, { useState, useEffect } from "react";
import {
  AdminApiService,
  AdminTeacher,
  AdminSubject,
  AdminCourse,
} from "@/src/services/adminApi";
import {
  GraduationCap,
  PlusCircle,
  X,
  Search,
  Check,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen,
  UserCheck,
  Key,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<string>("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Teacher Form
  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "Teacher@123",
    employeeCode: "",
    gender: "MALE",
    qualification: "",
    specialization: "",
    experienceYears: 0,
    joiningDate: new Date().toISOString().split("T")[0],
    bio: "",
    address: "",
    subjectIds: [] as string[],
  };

  const [addForm, setAddForm] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleGenerateTeacherPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddForm((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  // Edit Teacher Form
  const [editForm, setEditForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeCode: "",
    gender: "MALE",
    qualification: "",
    specialization: "",
    experienceYears: 0,
    status: "ACTIVE",
    bio: "",
    address: "",
    joiningDate: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [teaRes, subRes, couRes] = await Promise.allSettled([
        AdminApiService.getTeachers(),
        AdminApiService.getSubjects(),
        AdminApiService.getCourses(),
      ]);

      let loadedSubjects: AdminSubject[] = [];
      if (subRes.status === "fulfilled" && Array.isArray(subRes.value)) {
        loadedSubjects = subRes.value;
        setSubjects(subRes.value);
      } else {
        setSubjects([]);
      }

      if (couRes.status === "fulfilled" && Array.isArray(couRes.value)) {
        setCourses(couRes.value);
      } else {
        setCourses([]);
      }

      if (teaRes.status === "fulfilled" && Array.isArray(teaRes.value)) {
        setTeachers(teaRes.value);
      } else {
        setTeachers([]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load faculty from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add Teacher Submission
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!addForm.firstName.trim() || !addForm.lastName.trim()) {
      setErrorMsg("First Name and Last Name are required.");
      return;
    }

    if (!addForm.email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (!addForm.phone.trim()) {
      setErrorMsg("Phone number is required for faculty record.");
      return;
    }

    const payload = {
      firstName: addForm.firstName.trim(),
      lastName: addForm.lastName.trim(),
      email: addForm.email.trim().toLowerCase(),
      phone: addForm.phone.trim(),
      password: addForm.password.trim() || undefined,
      employeeCode: addForm.employeeCode.trim() || undefined,
      gender: addForm.gender || undefined,
      qualification: addForm.qualification.trim() || undefined,
      specialization: addForm.specialization.trim() || undefined,
      experienceYears: Number(addForm.experienceYears) || 0,
      joiningDate: addForm.joiningDate || undefined,
      bio: addForm.bio.trim() || undefined,
      address: addForm.address.trim() || undefined,
      subjectIds: addForm.subjectIds.length > 0 ? addForm.subjectIds : undefined,
    };

    setIsSubmitting(true);
    try {
      await AdminApiService.createTeacher(payload);
      setSuccessMsg(
        `Faculty member ${payload.firstName} ${payload.lastName} registered successfully!`
      );
      setIsAddModalOpen(false);
      setShowPassword(false);
      setAddForm(initialFormState);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to register faculty member in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || "",
      employeeCode: teacher.employeeCode || "",
      gender: teacher.gender || "MALE",
      qualification: teacher.qualification || "",
      specialization: teacher.specialization || "",
      experienceYears: Number(teacher.experienceYears) || 0,
      status: teacher.status || "ACTIVE",
      bio: teacher.bio || "",
      address: teacher.address || "",
      joiningDate: teacher.joiningDate
        ? new Date(teacher.joiningDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Teacher Submission
  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const updatePayload = {
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim(),
      gender: editForm.gender,
      qualification: editForm.qualification.trim() || null,
      specialization: editForm.specialization.trim() || null,
      experienceYears: Number(editForm.experienceYears) || 0,
      status: editForm.status,
      bio: editForm.bio.trim() || null,
      address: editForm.address.trim() || null,
    };

    try {
      await AdminApiService.updateTeacher(editForm.id, updatePayload);
      setSuccessMsg(`Faculty profile updated successfully.`);
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update faculty profile in database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open View Profile Modal
  const openViewModal = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (teacher: AdminTeacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Teacher
  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await AdminApiService.deleteTeacher(selectedTeacher.id);
      setSuccessMsg(`Faculty record for ${selectedTeacher.firstName} removed.`);
      setIsDeleteModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to delete faculty member. They may be assigned to batches or timetables.");
    } finally {
      setIsSubmitting(false);
      setSelectedTeacher(null);
    }
  };

  // Subject multi-select toggle in Add Form
  const toggleSubjectSelection = (subjectId: string) => {
    setAddForm((prev) => {
      const exists = prev.subjectIds.includes(subjectId);
      if (exists) {
        return {
          ...prev,
          subjectIds: prev.subjectIds.filter((id) => id !== subjectId),
        };
      } else {
        return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
      }
    });
  };

  // Extract unique specializations for filter
  const uniqueSpecializations = Array.from(
    new Set(teachers.map((t) => t.specialization).filter(Boolean) as string[])
  );

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    const searchMatch =
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.employeeCode && t.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.phone && t.phone.includes(searchTerm)) ||
      (t.qualification && t.qualification.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const statusMatch =
      statusFilter === "ALL" ||
      t.status.toUpperCase() === statusFilter.toUpperCase();

    const specMatch =
      specializationFilter === "ALL" ||
      t.specialization === specializationFilter;

    return searchMatch && statusMatch && specMatch;
  });

  const activeCount = teachers.filter((t) => t.status === "ACTIVE").length;
  const avgExp =
    teachers.length > 0
      ? (
          teachers.reduce((acc, t) => acc + (Number(t.experienceYears) || 0), 0) /
          teachers.length
        ).toFixed(1)
      : "0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toast / Notification Banner */}
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
            style={{
              background: "transparent",
              border: "none",
              color: "#15803d",
              cursor: "pointer",
            }}
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
              background: "#ede9fe",
              color: "#6d28d9",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            <GraduationCap size={13} />
            <span>Academic Faculty Registry</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            Teacher & Faculty Management
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            Manage campus faculty profiles, qualifications, subject expertise, and lecture assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setIsAddModalOpen(true);
          }}
          className="btn btn-primary"
          style={{
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          <PlusCircle size={18} /> Add Faculty Member
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid-cols-4">
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
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
            <GraduationCap size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Total Faculty
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{teachers.length}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
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
            <UserCheck size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Active Educators
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{activeCount}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
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
            <BookOpen size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Subjects Covered
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{subjects.length}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
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
            <Award size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              Avg. Experience
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{avgExp} yrs</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "#ffffff",
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Search input */}
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
            placeholder="Search by faculty name, email, code, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem 0.6rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              background: "#ffffff",
            }}
          />
        </div>

        {/* Filter Pills & Select */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Status filter tabs */}
          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              borderRadius: "8px",
              padding: "3px",
              gap: "2px",
            }}
          >
            {["ALL", "ACTIVE", "INACTIVE", "RESIGNED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  border: "none",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: statusFilter === status ? "#ffffff" : "transparent",
                  color: statusFilter === status ? "var(--color-primary)" : "#64748b",
                  boxShadow: statusFilter === status ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Specialization Filter Dropdown */}
          {uniqueSpecializations.length > 0 && (
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              style={{
                padding: "0.45rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                background: "#ffffff",
                color: "#334155",
              }}
            >
              <option value="ALL">All Specializations</option>
              {uniqueSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Teachers Table Card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="data-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "1.25rem" }}>Faculty Member</th>
                <th>Contact Info</th>
                <th>Qualifications & Exp</th>
                <th>Specialization & Subjects</th>
                <th>Status</th>
                <th style={{ textAlign: "right", paddingRight: "1.25rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((tea) => {
                  const initial = `${tea.firstName?.[0] || ""}${tea.lastName?.[0] || ""}`.toUpperCase();
                  const subjectsList = tea.subjects || [];

                  return (
                    <tr key={tea.id}>
                      {/* Name and Employee Code */}
                      <td style={{ paddingLeft: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.925rem", color: "#0f172a" }}>
                              {tea.firstName} {tea.lastName}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                fontFamily: "monospace",
                                fontWeight: 600,
                                marginTop: "1px",
                              }}
                            >
                              {tea.employeeCode || `ID: ${tea.id.slice(0, 8)}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <a
                            href={`mailto:${tea.email}`}
                            style={{
                              fontSize: "0.825rem",
                              color: "#2563eb",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Mail size={12} /> {tea.email}
                          </a>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "#64748b",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={12} /> {tea.phone || "+91 98111 22334"}
                          </span>
                        </div>
                      </td>

                      {/* Qualifications & Experience */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.825rem",
                              color: "#1e293b",
                            }}
                          >
                            {tea.qualification || "Ph.D. / Master's"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Briefcase size={12} /> {tea.experienceYears || 0} Years Exp.
                          </span>
                        </div>
                      </td>

                      {/* Specialization & Subject pills */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#334155" }}>
                            {tea.specialization || "General Faculty"}
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {subjectsList.length > 0 ? (
                              subjectsList.map((ts, idx) => (
                                <span
                                  key={idx}
                                  className="badge badge-primary"
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "0.15rem 0.5rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {ts.subject?.name || "Subject"}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                Core Faculty
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            tea.status === "ACTIVE"
                              ? "badge-success"
                              : tea.status === "INACTIVE"
                              ? "badge-warning"
                              : "badge-gray"
                          }`}
                          style={{ fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          {tea.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ textAlign: "right", paddingRight: "1.25rem" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => openViewModal(tea)}
                            title="View Faculty Profile"
                            className="btn btn-outline"
                            style={{ padding: "0.35rem 0.5rem" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(tea)}
                            title="Edit Details"
                            className="btn btn-outline"
                            style={{ padding: "0.35rem 0.5rem" }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(tea)}
                            title="Delete Faculty Member"
                            className="btn btn-outline"
                            style={{ padding: "0.35rem 0.5rem", color: "#ef4444" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <GraduationCap size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontWeight: 600 }}>No faculty members found.</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                      Try adjusting your search criteria or register a new faculty member above.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD FACULTY MEMBER MODAL                                              */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
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
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#ede9fe",
                    color: "#6d28d9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                    Add Faculty Member
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Register a new teacher and map subject specializations
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddTeacher} style={{ padding: "1.5rem" }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Personal Information */}
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "0.25rem",
                  }}
                >
                  1. Personal & Contact Details
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harish"
                      value={addForm.firstName}
                      onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Verma"
                      value={addForm.lastName}
                      onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. h.verma@apex.edu"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98111 22334"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Gender
                    </label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Employee Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      value={addForm.employeeCode}
                      onChange={(e) => setAddForm({ ...addForm, employeeCode: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                {/* Initial Account Password Field */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Key size={14} color="#6d28d9" /> Initial Account Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTeacherPassword}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#6d28d9",
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
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Set teacher password (min 6 characters)"
                      minLength={6}
                      style={{
                        width: "100%",
                        padding: "0.55rem 2.25rem 0.55rem 0.75rem",
                        borderRadius: "8px",
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
                  <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem", margin: "0.25rem 0 0 0" }}>
                    The teacher will use this password alongside their Email or Employee Code to log into the Faculty Portal.
                  </p>
                </div>

                {/* Professional Qualifications */}
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "0.25rem",
                    marginTop: "0.5rem",
                  }}
                >
                  2. Academic Qualifications & Specialization
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Highest Qualification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ph.D. IIT Kanpur, M.Sc"
                      value={addForm.qualification}
                      onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={addForm.experienceYears}
                      onChange={(e) => setAddForm({ ...addForm, experienceYears: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mechanics & Quantum Physics, Integral Calculus"
                    value={addForm.specialization}
                    onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                {/* Subject Selection Checklist */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                    Qualified Subjects to Teach (Select all that apply)
                  </label>
                  <div
                    style={{
                      maxHeight: "130px",
                      overflowY: "auto",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      background: "#f8fafc",
                    }}
                  >
                    {subjects.length > 0 ? (
                      subjects.map((sub) => {
                        const checked = addForm.subjectIds.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontSize: "0.825rem",
                              cursor: "pointer",
                              padding: "0.25rem 0.4rem",
                              borderRadius: "4px",
                              background: checked ? "#eff6ff" : "transparent",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSubjectSelection(sub.id)}
                            />
                            <span style={{ fontWeight: checked ? 700 : 500 }}>
                              {sub.name} <span style={{ color: "#64748b", fontSize: "0.75rem" }}>({sub.code})</span>
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "center", padding: "0.5rem" }}>
                        No curriculum subjects configured yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio / Summary & Office Location */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Faculty Bio / Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Educational background, research experience..."
                      value={addForm.bio}
                      onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Campus Office / Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Academic Block B, Room 204"
                      value={addForm.address}
                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
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
                  onClick={() => setIsAddModalOpen(false)}
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
                  {isSubmitting ? "Saving..." : "Save Faculty Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT FACULTY MODAL                                                     */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
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
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Edit size={18} color="#4f46e5" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Edit Faculty Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditTeacher} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={editForm.qualification}
                      onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.experienceYears}
                      onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={editForm.specialization}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Faculty Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="RESIGNED">RESIGNED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Bio / Profile Summary
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
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
                  onClick={() => setIsEditModalOpen(false)}
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
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW FACULTY PROFILE DOSSIER MODAL                                     */}
      {/* ========================================================================= */}
      {isViewModalOpen && selectedTeacher && (
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
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header with avatar */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                padding: "1.75rem 1.5rem",
                color: "#ffffff",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
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

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  {selectedTeacher.firstName?.[0]}
                  {selectedTeacher.lastName?.[0]}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h3>
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: selectedTeacher.status === "ACTIVE" ? "#22c55e" : "#eab308",
                        color: "#ffffff",
                      }}
                    >
                      {selectedTeacher.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                    {selectedTeacher.employeeCode || "FACULTY RECORD"} • {selectedTeacher.qualification || "Educator"}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Contact Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  background: "#f8fafc",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    Email
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#0f172a" }}>
                    {selectedTeacher.email}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    Contact Phone
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#0f172a" }}>
                    {selectedTeacher.phone || "+91 98111 22334"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    Experience
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#0f172a" }}>
                    {selectedTeacher.experienceYears || 0} Years Teaching
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                    Campus Cabin
                  </div>
                  <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "#0f172a" }}>
                    {selectedTeacher.address || "Faculty Wing"}
                  </div>
                </div>
              </div>

              {/* Specialization & Subjects */}
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Specialization:
                </div>
                <div style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>
                  {selectedTeacher.specialization || "General Faculty"}
                </div>
              </div>

              {/* Qualified Subjects */}
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Qualified Curriculum Subjects:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? (
                    selectedTeacher.subjects.map((s, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>
                        {s.subject?.name} ({s.subject?.code})
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Assigned to General Foundation Modules.
                    </span>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              {selectedTeacher.bio && (
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    About Educator:
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
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
                  setIsViewModalOpen(false);
                  openEditModal(selectedTeacher);
                }}
                className="btn btn-primary"
                style={{ fontSize: "0.825rem" }}
              >
                <Edit size={14} /> Edit Record
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
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
      {/* 4. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedTeacher && (
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
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Remove Faculty Member
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>
                  Confirm deletion of faculty profile
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to remove <strong>{selectedTeacher.firstName} {selectedTeacher.lastName}</strong> ({selectedTeacher.employeeCode}) from the faculty directory?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteTeacher}
                className="btn btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                {isSubmitting ? "Deleting..." : "Delete Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

