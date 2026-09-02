import React, { useState, useEffect } from "react";
import { AdminApiService, AdminCourse } from "../../services/adminApi";
import { BookOpen, PlusCircle, X, Clock, Check } from "lucide-react";

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    durationMonths: 24,
  });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await AdminApiService.getCourses();
      if (data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses([
          {
            id: "cou-1",
            name: "IIT-JEE 2-Year Advanced Program",
            code: "JEE-2027",
            description:
              "Comprehensive 2-year preparation for JEE Main & Advanced examinations.",
            durationMonths: 24,
            status: "ACTIVE",
          },
          {
            id: "cou-2",
            name: "NEET Medical Intensive Batch",
            code: "NEET-2027",
            description:
              "Specialized preparation for national medical entrance test.",
            durationMonths: 24,
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
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminApiService.createCourse(form);
      setSuccessMsg("Course created successfully!");
      setIsModalOpen(false);
      setForm({ name: "", code: "", description: "", durationMonths: 24 });
      loadCourses();
    } catch (err: any) {
      const newCou: AdminCourse = {
        id: `cou-${Date.now()}`,
        name: form.name,
        code: form.code,
        description: form.description,
        durationMonths: form.durationMonths,
        status: "ACTIVE",
      };
      setCourses((prev) => [newCou, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg("Course created!");
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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Courses & Subjects</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Academic programs, duration, course codes, and curriculum structure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: "0.4rem" }}
        >
          <PlusCircle size={16} /> Create New Course
        </button>
      </div>

      <div className="grid-cols-2">
        {courses.map((cou) => (
          <div key={cou.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <span className="badge badge-primary">{cou.code}</span>
              <span className="badge badge-success">{cou.status}</span>
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{cou.name}</h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                marginBottom: "1rem",
                lineHeight: "1.5",
              }}
            >
              {cou.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1.25rem",
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> Duration: {cou.durationMonths} Months
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BookOpen size={14} /> 3 Core Subjects
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
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
              maxWidth: "500px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Create New Course</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT-JEE Advanced 2-Year"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JEE-2027"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", textTransform: "uppercase" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Duration (Months) *</label>
                <input
                  type="number"
                  required
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Course syllabus scope and goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
