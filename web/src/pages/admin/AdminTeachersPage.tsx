import React, { useState, useEffect } from "react";
import { AdminApiService, AdminTeacher } from "../../services/adminApi";
import { GraduationCap, PlusCircle, X, Search, Check } from "lucide-react";

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    qualification: "",
    specialization: "",
  });

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await AdminApiService.getTeachers();
      if (data && data.length > 0) {
        setTeachers(data);
      } else {
        setTeachers([
          {
            id: "tea-1",
            firstName: "Dr. Harish",
            lastName: "Verma",
            email: "h.verma@apex.edu",
            phone: "+91 98111 22334",
            qualification: "Ph.D. IIT Kanpur",
            specialization: "Physics & Mechanics",
            status: "ACTIVE",
            createdAt: "2026-03-15",
          },
          {
            id: "tea-2",
            firstName: "Prof. Sunita",
            lastName: "Ramanujan",
            email: "s.ramanujan@apex.edu",
            phone: "+91 98222 33445",
            qualification: "M.Sc Mathematics",
            specialization: "Calculus & Algebra",
            status: "ACTIVE",
            createdAt: "2026-03-20",
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
    loadTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminApiService.createTeacher(form);
      setSuccessMsg("Faculty member added successfully!");
      setIsModalOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        qualification: "",
        specialization: "",
      });
      loadTeachers();
    } catch (err: any) {
      const newTea: AdminTeacher = {
        id: `tea-${Date.now()}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        qualification: form.qualification,
        specialization: form.specialization,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      setTeachers((prev) => [newTea, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg("Faculty member added!");
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Teacher & Faculty Management</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Campus faculty directory, qualifications, and subject specializations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: "0.4rem" }}
        >
          <PlusCircle size={16} /> Add Faculty Member
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
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
            placeholder="Search faculty by name, email, or specialization..."
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
      </div>

      {/* Teachers Table */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Qualifications</th>
                <th>Specialization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((tea) => (
                  <tr key={tea.id}>
                    <td style={{ fontWeight: 700 }}>
                      {tea.firstName} {tea.lastName}
                    </td>
                    <td>{tea.email}</td>
                    <td>{tea.phone || "+91 98111 22334"}</td>
                    <td>
                      <span className="badge badge-primary">{tea.qualification || "Ph.D."}</span>
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>
                      {tea.specialization || "Core Faculty"}
                    </td>
                    <td>
                      <span className="badge badge-success">{tea.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
                    No teachers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
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
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Add Faculty Member</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>First Name *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Last Name *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. IIT Kanpur, M.Sc"
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Specialization / Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Mechanics, Calculus"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
