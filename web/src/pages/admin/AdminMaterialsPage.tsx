import React, { useState, useEffect } from "react";
import { AdminApiService, AdminMaterial } from "@/src/services/adminApi";
import { FolderDown, FileText, PlusCircle, Download } from "lucide-react";

export const AdminMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMaterials = async () => {
      setLoading(true);
      try {
        const data = await AdminApiService.getMaterials();
        if (data && Array.isArray(data)) {
          setMaterials(data);
        } else {
          setMaterials([]);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Study Materials Repository</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Upload and manage course derivation notes, DPPs, PDFs, and video reference links.
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <FolderDown size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>No Study Materials Found</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            No course materials or lecture notes have been uploaded to the database repository yet.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {materials.map((mat) => (
          <div key={mat.id} className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{mat.title}</h3>
                <span className="badge badge-primary">{mat.fileType}</span>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                marginBottom: "1rem",
                lineHeight: "1.5",
              }}
            >
              {mat.description}
            </p>

            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "0.75rem",
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Uploaded: {new Date(mat.createdAt).toLocaleDateString()}</span>
              <a
                href={mat.fileUrl}
                download
                style={{
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Download size={14} /> Download Resource
              </a>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
