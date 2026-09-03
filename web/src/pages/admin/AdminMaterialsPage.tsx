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
        if (data && data.length > 0) {
          setMaterials(data);
        } else {
          setMaterials([
            {
              id: "mat-1",
              title: "Physics Mechanics & Kinematics Formula Book",
              description: "Complete formula derivations, summary tables, and solved numericals.",
              fileUrl: "#",
              fileType: "PDF",
              fileSize: 4200000,
              batchId: "bat-1",
              subjectId: "sub-1",
              createdAt: "2026-08-25",
            },
            {
              id: "mat-2",
              title: "Integral Calculus DPP Set 4",
              description: "Daily Practice Problems with comprehensive step-by-step solutions.",
              fileUrl: "#",
              fileType: "PDF",
              fileSize: 2100000,
              batchId: "bat-1",
              subjectId: "sub-2",
              createdAt: "2026-08-28",
            },
            {
              id: "mat-3",
              title: "Organic Chemistry Reaction Mechanism Notes",
              description: "Named reactions and electron displacement mechanisms for competitive exams.",
              fileUrl: "#",
              fileType: "PDF",
              fileSize: 3400000,
              batchId: "bat-1",
              subjectId: "sub-3",
              createdAt: "2026-08-30",
            },
          ]);
        }
      } catch (err) {
        console.error(err);
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
    </div>
  );
};
