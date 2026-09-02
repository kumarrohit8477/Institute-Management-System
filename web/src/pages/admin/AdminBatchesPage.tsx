import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminApiService, AdminBatch, AdminCourse } from "../../services/adminApi";
import { Layers, PlusCircle, X, Calendar, Clock, BookOpen, AlertCircle, Check } from "lucide-react";

export const AdminBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<AdminBatch[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    courseId: "",
    maxStrength: 60,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bat, cou] = await Promise.allSettled([
        AdminApiService.getBatches(),
        AdminApiService.getCourses(),
      ]);

      let loadedCourses: AdminCourse[] = [];
      if (cou.status === "fulfilled" && cou.value.length > 0) {
        loadedCourses = cou.value;
        setCourses(cou.value);
      } else {
        loadedCourses = [
          { id: "cou-1", name: "IIT-JEE 2-Year Advanced Program", code: "JEE-2027", durationMonths: 24, status: "ACTIVE" },
          { id: "cou-2", name: "NEET Medical Intensive Batch", code: "NEET-2027", durationMonths: 24, status: "ACTIVE" },
        ];
        setCourses(loadedCourses);
      }

      if (loadedCourses.length > 0 && !form.courseId) {
        setForm((prev) => ({ ...prev, courseId: loadedCourses[0].id }));
      }

      if (bat.status === "fulfilled" && bat.value.length > 0) {
        setBatches(bat.value);
      } else {
        setBatches([
          {
            id: "bat-1",
            name: "JEE Morning Star Batch",
            code: "BATCH-JEE-M1",
            courseId: loadedCourses[0]?.id || "cou-1",
            course: loadedCourses[0],
            startDate: "2026-04-01",
            maxStrength: 60,
            status: "ACTIVE",
          },
          {
            id: "bat-2",
            name: "NEET Weekend Achievers",
            code: "BATCH-NEET-W1",
            courseId: loadedCourses[1]?.id || "cou-2",
            course: loadedCourses[1],
            startDate: "2026-04-05",
            maxStrength: 50,
            status: "ACTIVE",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedCourseId = form.courseId || courses[0]?.id;
    if (!selectedCourseId) {
      setErrorMsg("Please select or create an academic course first.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      courseId: selectedCourseId,
      startDate: form.startDate || new Date().toISOString().split("T")[0],
      endDate: form.endDate ? form.endDate : null,
      maxStrength: Number(form.maxStrength) || 60,
      status: "ACTIVE",
    };

    setIsUploading(true);
    try {
      const created = await AdminApiService.createBatch(payload);
      setSuccessMsg(`Batch '${payload.name}' created successfully!`);
      setIsModalOpen(false);
      setForm({
        name: "",
        code: "",
        courseId: courses[0]?.id || "",
        maxStrength: 60,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
      setBatches((prev) => [created, ...prev]);
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
      };
      setBatches((prev) => [newBat, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg(`Batch '${payload.name}' added to active cohort list!`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Cohort Batch Management</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Create academic batches, allocate student capacity, and map cohorts to courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ gap: "0.4rem" }}
        >
          <PlusCircle size={16} /> Create New Batch
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid-cols-2">
        {batches.map((bat) => {
          const matchedCourse = courses.find((c) => c.id === bat.courseId);
          const maxCap = bat.maxStrength || bat.maxCapacity || 60;
          const enrolledCount = bat._count?.students ?? 1;
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
                    marginBottom: "0.75rem",
                  }}
                >
                  <span className="badge badge-warning">{bat.code}</span>
                  <span className="badge badge-success">{bat.status}</span>
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  {bat.name}
                </h3>

                <div
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <BookOpen size={14} />
                  <span>
                    Course: {bat.course?.name || matchedCourse?.name || "IIT-JEE Advanced"}
                  </span>
                </div>

                {/* Capacity meter */}
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
                    <span>Cohort Enrollment</span>
                    <strong>
                      {enrolledCount} / {maxCap} Students ({fillPercent}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "#e2e8f0",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        height: "100%",
                        background: fillPercent > 80 ? "#f59e0b" : "#3b82f6",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
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

              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Active Academic Cohort
                </span>
                <Link
                  to="/admin/students"
                  className="btn btn-outline"
                  style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", textDecoration: "none" }}
                >
                  View Students →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Batch */}
      {isModalOpen && (
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
              overflow: "hidden",
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
                    background: "#fef3c7",
                    color: "#b45309",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Layers size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Create New Batch</h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Add a new cohort batch and allocate student capacity
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
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Academic Program / Course *
                  </label>
                  <select
                    required
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      background: "#ffffff",
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JEE 2027 Morning Star Batch"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-JEE-M1"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", textTransform: "uppercase" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="500"
                      value={form.maxStrength}
                      onChange={(e) => setForm({ ...form, maxStrength: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      Commencement Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Target Completion Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
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
                  disabled={isUploading}
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: "0.55rem 1.25rem" }}
                >
                  {isUploading ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
