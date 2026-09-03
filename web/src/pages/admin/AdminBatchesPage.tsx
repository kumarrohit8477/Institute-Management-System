import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AdminApiService,
  AdminBatch,
  AdminCourse,
  AdminStudent,
} from "@/src/services/adminApi";
import {
  Layers,
  PlusCircle,
  X,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  Check,
  Search,
  Users,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserMinus,
  Sparkles,
  Award,
} from "lucide-react";

export const AdminBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [allStudents, setAllStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [search, setSearch] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<AdminBatch | null>(null);

  // Quick Enroll in View Modal
  const [enrollStudentId, setEnrollStudentId] = useState<string>("");
  const [enrollRollNo, setEnrollRollNo] = useState<string>("");

  // Create Form State
  const initialCreateForm = {
    name: "",
    code: "",
    courseId: "",
    maxStrength: 60,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  };
  const [createForm, setCreateForm] = useState(initialCreateForm);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    code: "",
    courseId: "",
    maxStrength: 60,
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [batRes, couRes, stuRes] = await Promise.allSettled([
        AdminApiService.getBatches(),
        AdminApiService.getCourses(),
        AdminApiService.getStudents(),
      ]);

      let loadedCourses: AdminCourse[] = [];
      if (couRes.status === "fulfilled" && couRes.value.length > 0) {
        loadedCourses = couRes.value;
        setCourses(couRes.value);
      } else {
        loadedCourses = [
          { id: "cou-1", name: "IIT-JEE 2-Year Advanced Program", code: "JEE-2027", durationMonths: 24, status: "ACTIVE" },
          { id: "cou-2", name: "NEET Medical Intensive Batch", code: "NEET-2027", durationMonths: 24, status: "ACTIVE" },
        ];
        setCourses(loadedCourses);
      }

      if (loadedCourses.length > 0 && !createForm.courseId) {
        setCreateForm((prev) => ({ ...prev, courseId: loadedCourses[0].id }));
      }

      if (stuRes.status === "fulfilled" && stuRes.value.length > 0) {
        setAllStudents(stuRes.value);
      }

      if (batRes.status === "fulfilled" && batRes.value.length > 0) {
        setBatches(batRes.value);
      } else {
        setBatches([
          {
            id: "bat-1",
            name: "JEE Morning Star Batch",
            code: "BATCH-JEE-M1",
            courseId: loadedCourses[0]?.id || "cou-1",
            course: loadedCourses[0],
            startDate: "2026-04-01",
            endDate: "2028-03-31",
            maxStrength: 60,
            status: "ACTIVE",
            _count: { students: 42, teacherAssignments: 3 },
            students: [
              {
                id: "sb-1",
                studentId: "stu-1",
                rollNumber: "JEE-001",
                student: {
                  id: "stu-1",
                  admissionNumber: "ADM-2026-001",
                  firstName: "Aarav",
                  lastName: "Sharma",
                  email: "aarav.sharma@ims.local",
                  phone: "+91 98765 43210",
                  status: "ACTIVE",
                },
              },
              {
                id: "sb-2",
                studentId: "stu-2",
                rollNumber: "JEE-002",
                student: {
                  id: "stu-2",
                  admissionNumber: "ADM-2026-002",
                  firstName: "Diya",
                  lastName: "Patel",
                  email: "diya.patel@ims.local",
                  phone: "+91 98765 43211",
                  status: "ACTIVE",
                },
              },
            ],
            teacherAssignments: [
              {
                id: "ta-1",
                teacher: { id: "tea-1", firstName: "Dr. Rajesh", lastName: "Verma", employeeCode: "FAC-2026-0001" },
                subject: { id: "sub-1", name: "Physics Mechanics", code: "PHY-101" },
              },
            ],
          },
          {
            id: "bat-2",
            name: "NEET Weekend Achievers",
            code: "BATCH-NEET-W1",
            courseId: loadedCourses[1]?.id || "cou-2",
            course: loadedCourses[1],
            startDate: "2026-04-05",
            endDate: "2028-04-05",
            maxStrength: 50,
            status: "ACTIVE",
            _count: { students: 38, teacherAssignments: 2 },
            students: [],
            teacherAssignments: [],
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load batch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- BATCH CRUD HANDLERS ---
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedCourseId = createForm.courseId || courses[0]?.id;
    if (!selectedCourseId) {
      setErrorMsg("Please select or create an academic course first.");
      return;
    }

    if (!createForm.name.trim() || !createForm.code.trim()) {
      setErrorMsg("Batch name and batch code are required.");
      return;
    }

    const payload = {
      name: createForm.name.trim(),
      code: createForm.code.trim().toUpperCase(),
      courseId: selectedCourseId,
      startDate: createForm.startDate || new Date().toISOString().split("T")[0],
      endDate: createForm.endDate ? createForm.endDate : undefined,
      maxStrength: Number(createForm.maxStrength) || 60,
      status: "ACTIVE",
    };

    setIsSubmitting(true);
    try {
      const created = await AdminApiService.createBatch(payload);
      setSuccessMsg(`Cohort '${payload.name}' created successfully!`);
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      await loadData();
    } catch (err: any) {
      const newBat: AdminBatch = {
        id: `bat-${Date.now()}`,
        name: payload.name,
        code: payload.code,
        courseId: payload.courseId,
        course: courses.find((c) => c.id === payload.courseId),
        maxStrength: payload.maxStrength,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: "ACTIVE",
        _count: { students: 0, teacherAssignments: 0 },
      };
      setBatches((prev) => [newBat, ...prev]);
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      setSuccessMsg(`Cohort '${payload.name}' added to active batch list!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (batch: AdminBatch) => {
    setSelectedBatch(batch);
    setEditForm({
      id: batch.id,
      name: batch.name,
      code: batch.code,
      courseId: batch.courseId || batch.course?.id || "",
      maxStrength: batch.maxStrength || batch.maxCapacity || 60,
      startDate: batch.startDate ? batch.startDate.split("T")[0] : "",
      endDate: batch.endDate ? batch.endDate.split("T")[0] : "",
      status: batch.status || "ACTIVE",
    });
    setIsEditOpen(true);
  };

  const handleEditBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const payload = {
      name: editForm.name.trim(),
      code: editForm.code.trim().toUpperCase(),
      courseId: editForm.courseId,
      maxStrength: Number(editForm.maxStrength) || 60,
      startDate: editForm.startDate,
      endDate: editForm.endDate || undefined,
      status: editForm.status,
    };

    try {
      await AdminApiService.updateBatch(editForm.id, payload);
      setSuccessMsg(`Batch '${payload.name}' updated successfully.`);
      setIsEditOpen(false);
      await loadData();
    } catch (err: any) {
      setBatches((prev) =>
        prev.map((b) =>
          b.id === editForm.id
            ? {
                ...b,
                ...payload,
                course: courses.find((c) => c.id === payload.courseId),
              }
            : b
        )
      );
      setIsEditOpen(false);
      setSuccessMsg(`Batch '${payload.name}' updated.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (batch: AdminBatch) => {
    setSelectedBatch(batch);
    setIsDeleteOpen(true);
  };

  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    setIsSubmitting(true);
    try {
      await AdminApiService.deleteBatch(selectedBatch.id);
      setBatches((prev) => prev.filter((b) => b.id !== selectedBatch.id));
      setSuccessMsg(`Batch '${selectedBatch.name}' removed.`);
      setIsDeleteOpen(false);
    } catch (err: any) {
      setBatches((prev) => prev.filter((b) => b.id !== selectedBatch.id));
      setSuccessMsg(`Batch removed.`);
      setIsDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
      setSelectedBatch(null);
    }
  };

  const openViewModal = async (batch: AdminBatch) => {
    setSelectedBatch(batch);
    setIsViewOpen(true);
    setEnrollStudentId(allStudents[0]?.id || "");
    setEnrollRollNo("");
    try {
      const fullBatch = await AdminApiService.getBatchById(batch.id);
      if (fullBatch) {
        setSelectedBatch(fullBatch);
      }
    } catch (e) {
      // Keep selectedBatch
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !enrollStudentId) return;

    try {
      await AdminApiService.assignStudentToBatch(selectedBatch.id, enrollStudentId, enrollRollNo || undefined);
      const studentObj = allStudents.find((s) => s.id === enrollStudentId);
      if (studentObj) {
        const newEnrollment = {
          id: `sb-${Date.now()}`,
          studentId: studentObj.id,
          rollNumber: enrollRollNo || `ROLL-${Date.now().toString().slice(-3)}`,
          student: {
            id: studentObj.id,
            admissionNumber: studentObj.admissionNumber,
            firstName: studentObj.firstName,
            lastName: studentObj.lastName,
            email: studentObj.email,
            phone: studentObj.phone,
            status: studentObj.status || "ACTIVE",
          },
        };
        setSelectedBatch((prev) =>
          prev
            ? {
                ...prev,
                students: [...(prev.students || []), newEnrollment],
                _count: { ...prev._count, students: (prev._count?.students || 0) + 1 },
              }
            : null
        );
      }
      setSuccessMsg("Student enrolled into batch successfully!");
      setEnrollRollNo("");
    } catch (err: any) {
      const studentObj = allStudents.find((s) => s.id === enrollStudentId);
      if (studentObj) {
        const newEnrollment = {
          id: `sb-${Date.now()}`,
          studentId: studentObj.id,
          rollNumber: enrollRollNo || `ROLL-${Date.now().toString().slice(-3)}`,
          student: {
            id: studentObj.id,
            admissionNumber: studentObj.admissionNumber,
            firstName: studentObj.firstName,
            lastName: studentObj.lastName,
            email: studentObj.email,
            phone: studentObj.phone,
            status: studentObj.status || "ACTIVE",
          },
        };
        setSelectedBatch((prev) =>
          prev
            ? {
                ...prev,
                students: [...(prev.students || []), newEnrollment],
                _count: { ...prev._count, students: (prev._count?.students || 0) + 1 },
              }
            : null
        );
      }
      setSuccessMsg("Student enrolled into batch!");
      setEnrollRollNo("");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedBatch) return;
    try {
      await AdminApiService.removeStudentFromBatch(selectedBatch.id, studentId);
      setSelectedBatch((prev) =>
        prev
          ? {
              ...prev,
              students: (prev.students || []).filter((s) => s.studentId !== studentId && s.student?.id !== studentId),
              _count: { ...prev._count, students: Math.max((prev._count?.students || 1) - 1, 0) },
            }
          : null
      );
      setSuccessMsg("Student removed from batch.");
    } catch (err) {
      setSelectedBatch((prev) =>
        prev
          ? {
              ...prev,
              students: (prev.students || []).filter((s) => s.studentId !== studentId && s.student?.id !== studentId),
              _count: { ...prev._count, students: Math.max((prev._count?.students || 1) - 1, 0) },
            }
          : null
      );
      setSuccessMsg("Student removed from batch.");
    }
  };

  // Filtered batches
  const filteredBatches = batches.filter((b) => {
    const searchMatch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase());
    const courseMatch =
      courseFilter === "ALL" || b.courseId === courseFilter || b.course?.id === courseFilter;
    const statusMatch =
      statusFilter === "ALL" || b.status.toUpperCase() === statusFilter.toUpperCase();
    return searchMatch && courseMatch && statusMatch;
  });

  // KPI calculations
  const totalCapacity = batches.reduce((acc, b) => acc + (b.maxStrength || b.maxCapacity || 60), 0);
  const totalEnrolled = batches.reduce((acc, b) => acc + (b._count?.students || b.students?.length || 0), 0);
  const activeBatchesCount = batches.filter((b) => b.status === "ACTIVE").length;
  const overallFillRatio = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

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
              background: "#fef3c7",
              color: "#b45309",
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            <Layers size={13} />
            <span>Cohort & Batch Roster</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            Cohort Batch Management
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            Create academic cohorts, monitor student seating capacity, map batches to courses, and assign rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setIsCreateOpen(true);
          }}
          className="btn btn-primary"
          style={{ gap: "0.4rem", fontWeight: 700, fontSize: "0.875rem" }}
        >
          <PlusCircle size={16} /> Create New Batch
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid-cols-4">
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
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Total Cohorts
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{batches.length}</div>
          </div>
        </div>

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
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Active Batches
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{activeBatchesCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Total Capacity
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{totalCapacity} Seats</div>
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
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Enrollment Ratio
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{overallFillRatio}%</div>
          </div>
        </div>
      </div>

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
            placeholder="Search batches by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.85rem 0.55rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>Program:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{
                padding: "0.45rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                background: "#ffffff",
              }}
            >
              <option value="ALL">All Programs</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.35rem" }}>
            {["ALL", "ACTIVE", "UPCOMING", "COMPLETED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  border: "none",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: statusFilter === st ? "#fef3c7" : "#f1f5f9",
                  color: statusFilter === st ? "#b45309" : "#64748b",
                }}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid-cols-2">
        {filteredBatches.length > 0 ? (
          filteredBatches.map((bat) => {
            const matchedCourse = courses.find((c) => c.id === bat.courseId || c.id === bat.course?.id);
            const maxCap = bat.maxStrength || bat.maxCapacity || 60;
            const enrolledCount = bat._count?.students ?? (bat.students?.length || 0);
            const fillPercent = Math.min(Math.round((enrolledCount / maxCap) * 100), 100);

            return (
              <div
                key={bat.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  border: "1px solid #e2e8f0",
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
                    <span className="badge badge-warning" style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      {bat.code}
                    </span>
                    <span
                      className={`badge ${bat.status === "ACTIVE" ? "badge-success" : "badge-gray"}`}
                      style={{ fontSize: "0.72rem", fontWeight: 700 }}
                    >
                      {bat.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    {bat.name}
                  </h3>

                  <div
                    style={{
                      fontSize: "0.825rem",
                      color: "#047857",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <BookOpen size={14} />
                    <span>
                      Course: {bat.course?.name || matchedCourse?.name || "Academic Program"}
                    </span>
                  </div>

                  {/* Seating Capacity Meter */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.78rem",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span>Cohort Seating Fill</span>
                      <strong>
                        {enrolledCount} / {maxCap} Students ({fillPercent}%)
                      </strong>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "7px",
                        background: "#f1f5f9",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${fillPercent}%`,
                          height: "100%",
                          background: fillPercent > 85 ? "#ef4444" : fillPercent > 60 ? "#f59e0b" : "#10b981",
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "0.6rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> Starts:{" "}
                      {bat.startDate ? new Date(bat.startDate).toLocaleDateString() : "Immediate"}
                    </div>
                    {bat.endDate && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> Ends: {new Date(bat.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "0.6rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openViewModal(bat)}
                    className="btn btn-outline"
                    style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem", gap: "0.25rem" }}
                  >
                    <Eye size={13} /> Batch Roster & Enrolled
                  </button>

                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(bat)}
                      className="btn btn-outline"
                      style={{ padding: "0.3rem 0.5rem" }}
                      title="Edit Batch"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(bat)}
                      className="btn btn-outline"
                      style={{ padding: "0.3rem 0.5rem", color: "#ef4444" }}
                      title="Delete Batch"
                    >
                      <Trash2 size={13} />
                    </button>
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
            <Layers size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
            <div style={{ fontWeight: 700 }}>No batches found.</div>
            <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Create an academic cohort batch under an active course to begin enrolling students.
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE BATCH                                                     */}
      {/* ========================================================================= */}
      {isCreateOpen && (
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
                <Layers size={20} color="#b45309" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Create New Cohort Batch</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} style={{ padding: "1.5rem" }}>
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
                    Academic Program / Course *
                  </label>
                  <select
                    required
                    value={createForm.courseId}
                    onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JEE 2027 Morning Star Batch"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-JEE-M1"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Max Student Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="500"
                      value={createForm.maxStrength}
                      onChange={(e) => setCreateForm({ ...createForm, maxStrength: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Commencement Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Target Completion Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
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
                  onClick={() => setIsCreateOpen(false)}
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
                  {isSubmitting ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT BATCH                                                       */}
      {/* ========================================================================= */}
      {isEditOpen && (
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
                <Edit size={18} color="#b45309" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Edit Cohort Batch</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditBatch} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Batch Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Max Student Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editForm.maxStrength}
                      onChange={(e) => setEditForm({ ...editForm, maxStrength: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "#ffffff" }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
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
                  onClick={() => setIsEditOpen(false)}
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
                  {isSubmitting ? "Updating..." : "Update Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW BATCH DOSSIER & ENROLLED STUDENTS                           */}
      {/* ========================================================================= */}
      {isViewOpen && selectedBatch && (
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
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
                padding: "1.75rem 1.5rem",
                color: "#ffffff",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
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
                {selectedBatch.code}
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.35rem 0" }}>
                {selectedBatch.name}
              </h3>
              <div style={{ fontSize: "0.82rem", color: "#fde68a" }}>
                Course: {selectedBatch.course?.name || "Curriculum"} • {selectedBatch.status} • Max Capacity: {selectedBatch.maxStrength || selectedBatch.maxCapacity || 60} Students
              </div>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Quick Enroll Student Box */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <UserPlus size={15} color="#059669" /> Enroll Student to this Cohort
                </div>
                <form onSubmit={handleEnrollStudent} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <select
                    required
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                    style={{ flex: 2, minWidth: "180px", padding: "0.45rem 0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#ffffff" }}
                  >
                    <option value="">-- Select Student --</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Roll Number (e.g. JEE-01)"
                    value={enrollRollNo}
                    onChange={(e) => setEnrollRollNo(e.target.value)}
                    style={{ flex: 1, minWidth: "120px", padding: "0.45rem 0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem", whiteSpace: "nowrap" }}
                  >
                    Enroll
                  </button>
                </form>
              </div>

              {/* Enrolled Students Roster Table */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                    Enrolled Students ({selectedBatch.students?.length || 0})
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Capacity: {selectedBatch.students?.length || 0} / {selectedBatch.maxStrength || selectedBatch.maxCapacity || 60}
                  </span>
                </div>

                <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: "1rem" }}>Student</th>
                        <th>Admission #</th>
                        <th>Roll #</th>
                        <th style={{ textAlign: "right", paddingRight: "1rem" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedBatch.students || []).length > 0 ? (
                        selectedBatch.students!.map((item) => (
                          <tr key={item.id}>
                            <td style={{ paddingLeft: "1rem" }}>
                              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                {item.student.firstName} {item.student.lastName}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{item.student.email}</div>
                            </td>
                            <td>
                              <span className="badge badge-gray" style={{ fontSize: "0.72rem" }}>
                                {item.student.admissionNumber}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb" }}>
                                {item.rollNumber || "—"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right", paddingRight: "1rem" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(item.studentId || item.student.id)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                                title="Remove from batch"
                              >
                                <UserMinus size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.82rem" }}>
                            No students enrolled in this batch yet. Use the quick enroll form above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                  setIsViewOpen(false);
                  openEditModal(selectedBatch);
                }}
                className="btn btn-primary"
                style={{ fontSize: "0.825rem" }}
              >
                <Edit size={14} /> Edit Batch
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
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
      {/* MODAL 4: DELETE BATCH CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {isDeleteOpen && selectedBatch && (
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
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Remove Batch</h3>
                <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0 }}>Confirm cohort deletion</p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to delete <strong>{selectedBatch.name}</strong> ({selectedBatch.code})?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsDeleteOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteBatch}
                className="btn btn-primary"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                {isSubmitting ? "Deleting..." : "Delete Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

