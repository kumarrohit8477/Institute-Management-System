import React, { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { InstituteApiService } from "../../services/instituteApi";
import {
  Image as ImageIcon,
  Building2,
  Upload,
  Trash2,
  X,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";

export const AdminBrandingPage: React.FC = () => {
  const { institute, updateInstituteLogo } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [logoTab, setLogoTab] = useState<"FILE" | "URL">("FILE");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLogoSrc = institute?.logoUrl
    ? InstituteApiService.getLogoFullUrl(institute.logoUrl)
    : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5 MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = logoTab === "FILE" ? logoPreview : externalUrl.trim();

    if (!payload) {
      setErrorMsg(
        logoTab === "FILE"
          ? "Please select an image file first."
          : "Please enter a valid image URL."
      );
      return;
    }

    setIsUploading(true);
    try {
      const res = await InstituteApiService.uploadLogo(
        payload,
        selectedFile?.name,
        selectedFile?.type
      );
      updateInstituteLogo(res.logoUrl);
      setSuccessMsg("Institute logo updated successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        setLogoPreview(null);
        setSelectedFile(null);
        setExternalUrl("");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove the institute logo?")) {
      return;
    }

    setIsUploading(true);
    try {
      await InstituteApiService.deleteLogo();
      updateInstituteLogo(null);
      setLogoPreview(null);
      setSelectedFile(null);
      setExternalUrl("");
      setSuccessMsg("Institute logo removed.");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove logo.");
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

      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Institute Branding & Visual Identity</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Customize your official campus logo, badge identity, and student portal banner.
        </p>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "16px",
              background: "#ffffff",
              border: "2px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {currentLogoSrc ? (
              <img
                src={currentLogoSrc}
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "6px",
                }}
              />
            ) : (
              <Building2 size={44} color="#2563eb" />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.3rem" }}>
              {institute?.name || "Apex Academy"}
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                marginBottom: "0.75rem",
              }}
            >
              Campus Code: <strong>{institute?.code || "CAMPUS-01"}</strong> • Status:{" "}
              <span className="badge badge-success">Active Partition</span>
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ gap: "0.4rem" }}
            >
              <ImageIcon size={16} /> Manage Institute Logo
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Logo Management */}
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
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              overflow: "hidden",
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
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                    Institute Logo & Branding
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                    Upload or update the official logo for {institute?.name || "your campus"}
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

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {errorMsg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "0.82rem",
                    marginBottom: "1rem",
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Preview Comparison */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                  padding: "1.25rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: "0.4rem" }}>
                    CURRENT LOGO
                  </div>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px dashed #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      overflow: "hidden",
                    }}
                  >
                    {currentLogoSrc ? (
                      <img
                        src={currentLogoSrc}
                        alt="Current"
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No Logo</span>
                    )}
                  </div>
                </div>

                <div style={{ color: "#94a3b8", fontSize: "1.25rem" }}>➔</div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.4rem" }}>
                    NEW PREVIEW
                  </div>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "2px solid #3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      overflow: "hidden",
                    }}
                  >
                    {logoPreview || externalUrl ? (
                      <img
                        src={logoPreview || externalUrl}
                        alt="New Preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Tabs */}
              <div
                style={{
                  display: "flex",
                  borderRadius: "8px",
                  background: "#f1f5f9",
                  padding: "3px",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLogoTab("FILE")}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    borderRadius: "6px",
                    border: "none",
                    background: logoTab === "FILE" ? "#ffffff" : "transparent",
                    color: logoTab === "FILE" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab("URL")}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    borderRadius: "6px",
                    border: "none",
                    background: logoTab === "URL" ? "#ffffff" : "transparent",
                    color: logoTab === "URL" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Image URL
                </button>
              </div>

              {logoTab === "FILE" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      padding: "1.75rem 1rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "#fafafa",
                    }}
                  >
                    <Upload size={28} style={{ color: "#3b82f6", margin: "0 auto 0.5rem auto" }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Click to choose image file</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                      Supports PNG, JPG, WebP, SVG (Max 5 MB)
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {institute?.logoUrl ? (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRemoveLogo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Remove Logo
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSaveLogo}
                  className="btn btn-primary"
                >
                  {isUploading ? "Saving..." : "Save Logo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
